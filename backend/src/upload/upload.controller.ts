import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import {
  ALLOWED_EXTENSIONS,
  AllowedExtension,
  validateOriginalFilename,
  validateMimeType,
  validateFileContent,
} from './file-validator.helper';

const MAX_STANDARD_BYTES = 20 * 1024 * 1024; // 20 MB standard limit
const MAX_IMPORTANT_BYTES = 100 * 1024 * 1024; // 100 MB critical/important limit

@Controller('upload')
@UseGuards(AuthGuard, RolesGuard)
export class UploadController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  listFiles() {
    const dirPath = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(dirPath)) {
      return [];
    }
    const files = fs.readdirSync(dirPath);
    return files
      .filter((file) => !file.startsWith('.') && file !== 'README.md') // Never list dotfiles or internal docs
      .map((file) => {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);
        return {
          filename: file,
          url: `/uploads/${file}`,
          sizeBytes: stat.size,
          createdAt: stat.birthtime,
        };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  @Delete(':filename')
  @Roles(Role.ADMIN)
  async deleteFile(@Param('filename') filename: string, @Req() req: any) {
    if (!filename || typeof filename !== 'string') {
      throw new BadRequestException('Filename must be provided');
    }

    // 1. Strict format check: only safe characters (alphanumeric, dash, underscore, dot)
    // Disallows path traversal sequences ('..'), slashes, backslashes, null bytes
    if (
      filename.includes('..') ||
      filename.includes('/') ||
      filename.includes('\\') ||
      filename.includes('\0') ||
      !/^[a-zA-Z0-9_\-\.]+$/.test(filename)
    ) {
      throw new BadRequestException('Invalid filename or path traversal detected');
    }

    const safeFilename = path.basename(filename);
    const uploadsDir = path.resolve(process.cwd(), 'uploads');
    const filePath = path.resolve(uploadsDir, safeFilename);

    // Verify resolved path is strictly within the uploads directory
    if (!filePath.startsWith(uploadsDir + path.sep)) {
      throw new BadRequestException('Path traversal attempt detected');
    }

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`File ${safeFilename} not found`);
    }

    try {
      fs.unlinkSync(filePath);

      // Audit log the deletion
      const user = req.user;
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const ua = req.headers['user-agent'] || 'unknown';
      if (user && this.auditLogsService) {
        await this.auditLogsService.log(
          user.userId,
          'FILE_DELETE',
          ip,
          ua,
          { deletedFilename: safeFilename },
        );
      }

      return { success: true, message: `File ${safeFilename} deleted successfully` };
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof BadRequestException) {
        throw err;
      }
      throw new InternalServerErrorException(`Failed to delete file ${safeFilename}`);
    }
  }

  @Post()
  @Roles(Role.ADMIN, Role.EDITOR)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req: any, _file: any, cb: any) => {
          const dest = path.join(process.cwd(), 'uploads');
          if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
          }
          cb(null, dest);
        },
        filename: (_req: any, file: any, cb: any) => {
          // Cryptographically random UUID for storage identity to prevent overwrites,
          // guessing, and any path traversal via user-supplied names.
          const ext = path.extname(file.originalname).toLowerCase();
          const safeExt = ALLOWED_EXTENSIONS.includes(ext as AllowedExtension) ? ext : '.bin';
          const storageFilename = `${crypto.randomUUID()}${safeExt}`;
          cb(null, storageFilename);
        },
      }),
      limits: {
        fileSize: MAX_IMPORTANT_BYTES, // Multer hard ceiling (100MB)
        files: 1,                      // Exactly 1 file per upload request
      },
      fileFilter: (_req: any, file: any, cb: any) => {
        // Step 1: Validate original filename format and extensions
        const filenameValidation = validateOriginalFilename(file.originalname);
        if (!filenameValidation.valid) {
          return cb(new BadRequestException(filenameValidation.error), false);
        }

        // Step 2: Validate declared MIME type
        const ext = path.extname(file.originalname).toLowerCase() as AllowedExtension;
        const mimeValidation = validateMimeType(ext, file.mimetype);
        if (!mimeValidation.valid) {
          return cb(new BadRequestException(mimeValidation.error), false);
        }

        cb(null, true);
      },
    }),
  )
  async uploadFile(@UploadedFile() file: any, @Body() body: any, @Req() req: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded or file rejected by validation.');
    }

    const filePath = path.join(process.cwd(), 'uploads', file.filename);
    const ext = path.extname(file.originalname).toLowerCase() as AllowedExtension;
    const isImportant =
      body?.isImportant === 'true' || body?.isImportant === true || body?.isImportant === '1';

    // Step 3: Size limit validation
    if (file.size === 0) {
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (e) {}
      throw new BadRequestException('File is empty (0 bytes).');
    }

    if (file.size > MAX_STANDARD_BYTES && !isImportant) {
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (e) {}
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      throw new BadRequestException(
        `File size (${sizeMB} MB) exceeds standard 20 MB limit. Check "Important" to allow uploads up to 100 MB.`,
      );
    }

    if (file.size > MAX_IMPORTANT_BYTES) {
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (e) {}
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      throw new BadRequestException(
        `File size (${sizeMB} MB) exceeds maximum permissible limit of 100 MB.`,
      );
    }

    // Step 4: Magic bytes / deep content validation
    const contentValidation = validateFileContent(filePath, ext);
    if (!contentValidation.valid) {
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (e) {}
      throw new BadRequestException(`File content validation failed: ${contentValidation.error}`);
    }

    // Step 5: Audit log successful file upload
    const user = req.user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    if (user && this.auditLogsService) {
      await this.auditLogsService.log(user.userId, 'FILE_UPLOAD', ip, ua, {
        storageFilename: file.filename,
        originalFilename: path.basename(file.originalname),
        sizeBytes: file.size,
        mimetype: file.mimetype,
        isImportant,
      });
    }

    // Sanitize display filename (prevent XSS in original name presentation)
    const sanitizedOriginalName = path.basename(file.originalname).replace(/[^\w\.\-\s]/gi, '_');

    // Return relative URL for static hosting
    const relativeUrl = `/uploads/${file.filename}`;
    return {
      url: relativeUrl,
      filename: file.filename,
      originalName: sanitizedOriginalName,
      sizeBytes: file.size,
      isImportant,
    };
  }
}
