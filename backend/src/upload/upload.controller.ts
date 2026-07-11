import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { AuthGuard } from '../auth/auth.guard';

@Controller('upload')
@UseGuards(AuthGuard)
export class UploadController {
  @Post()
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
          // Sanitize filename to comply with GIGW and URL safety
          const originalName = file.originalname;
          const ext = path.extname(originalName);
          const nameWithoutExt = path.basename(originalName, ext)
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-') // replace non-alphanumeric with hyphen
            .replace(/-+/g, '-'); // collapse multiple hyphens
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (_req: any, file: any, cb: any) => {
        // Allowed extensions: pdf, jpg, jpeg, png, doc, docx, xls, xlsx
        const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.xls', '.xlsx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(ext)) {
          cb(null, true);
        } else {
          cb(new BadRequestException(`Unsupported file type: ${ext}. Allowed types: ${allowedExtensions.join(', ')}`), false);
        }
      },
    }),
  )
  uploadFile(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded or file rejected by validation.');
    }
    // Return relative URL for static hosting
    const relativeUrl = `/uploads/${file.filename}`;
    return {
      url: relativeUrl,
      filename: file.originalname,
      sizeBytes: file.size,
    };
  }
}
