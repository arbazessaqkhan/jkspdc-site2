import * as fs from 'fs';
import * as path from 'path';

export const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.jpg',
  '.jpeg',
  '.png',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
] as const;

export type AllowedExtension = (typeof ALLOWED_EXTENSIONS)[number];

export const ALLOWED_MIME_TYPES: Record<AllowedExtension, string[]> = {
  '.pdf': ['application/pdf'],
  '.jpg': ['image/jpeg', 'image/pjpeg'],
  '.jpeg': ['image/jpeg', 'image/pjpeg'],
  '.png': ['image/png'],
  '.doc': ['application/msword'],
  '.docx': [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
    'application/octet-stream',
  ],
  '.xls': ['application/vnd.ms-excel', 'application/msexcel'],
  '.xlsx': [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/octet-stream',
  ],
};

const DANGEROUS_EXTENSIONS = [
  'exe', 'bat', 'cmd', 'sh', 'php', 'phtml', 'php3', 'php4', 'php5',
  'js', 'vbs', 'scr', 'msi', 'ps1', 'jar', 'com', 'asp', 'aspx',
  'jsp', 'svg', 'htm', 'html', 'shtml', 'dll', 'bin', 'cgi', 'pl'
];

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates original filename for double extensions or path traversal tokens.
 */
export function validateOriginalFilename(originalName: string): ValidationResult {
  if (!originalName || typeof originalName !== 'string') {
    return { valid: false, error: 'Original filename must be provided' };
  }

  // Block null bytes or directory traversal characters in original name
  if (originalName.includes('\0') || originalName.includes('/') || originalName.includes('\\') || originalName.includes('..')) {
    return { valid: false, error: 'Filename contains invalid or directory traversal characters' };
  }

  const ext = path.extname(originalName).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext as AllowedExtension)) {
    return {
      valid: false,
      error: `Unsupported file extension: ${ext}. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`,
    };
  }

  // Check for dangerous double extensions (e.g., sample.php.pdf, invoice.exe.png)
  const parts = path.basename(originalName).toLowerCase().split('.');
  if (parts.length > 2) {
    for (let i = 1; i < parts.length - 1; i++) {
      if (DANGEROUS_EXTENSIONS.includes(parts[i])) {
        return {
          valid: false,
          error: `Prohibited multi-extension filename containing dangerous extension token: .${parts[i]}`,
        };
      }
    }
  }

  return { valid: true };
}

/**
 * Validates declared MIME type matches the declared extension.
 */
export function validateMimeType(ext: AllowedExtension, declaredMime: string): ValidationResult {
  const allowed = ALLOWED_MIME_TYPES[ext];
  if (!allowed || !allowed.includes(declaredMime.toLowerCase())) {
    return {
      valid: false,
      error: `Declared MIME type '${declaredMime}' does not match allowed types for '${ext}'.`,
    };
  }
  return { valid: true };
}

/**
 * Inspects file contents and magic bytes on disk.
 */
export function validateFileContent(filePath: string, ext: AllowedExtension): ValidationResult {
  if (!fs.existsSync(filePath)) {
    return { valid: false, error: 'Uploaded file not found on disk' };
  }

  const stat = fs.statSync(filePath);
  if (stat.size === 0) {
    return { valid: false, error: 'Uploaded file is empty (0 bytes)' };
  }

  // Read header chunk (up to 4096 bytes)
  const readSize = Math.min(4096, stat.size);
  const buffer = Buffer.alloc(readSize);
  const fd = fs.openSync(filePath, 'r');
  try {
    fs.readSync(fd, buffer, 0, readSize, 0);
  } finally {
    fs.closeSync(fd);
  }

  // 1. Generic checks against executable binaries and script wrappers
  if (buffer.length >= 2 && buffer[0] === 0x4D && buffer[1] === 0x5A) {
    return { valid: false, error: 'File contains Windows executable (MZ/PE) signature' };
  }
  if (buffer.length >= 4 && buffer[0] === 0x7F && buffer[1] === 0x45 && buffer[2] === 0x4C && buffer[3] === 0x46) {
    return { valid: false, error: 'File contains Linux ELF binary signature' };
  }
  if (buffer.length >= 2 && buffer[0] === 0x23 && buffer[1] === 0x21) {
    return { valid: false, error: 'File contains script shebang (#!) signature' };
  }

  // Check for HTML/Script injection in binary uploads
  const sampleString = buffer.toString('utf8', 0, Math.min(buffer.length, 1024)).toLowerCase();
  if (
    sampleString.includes('<script') ||
    sampleString.includes('<?php') ||
    sampleString.includes('<html') ||
    sampleString.includes('<!doctype html')
  ) {
    return { valid: false, error: 'File contains prohibited script or HTML markup' };
  }

  // 2. Format-specific magic byte verification
  switch (ext) {
    case '.pdf': {
      // Must start with '%PDF-' (0x25 0x50 0x44 0x46 0x2D)
      if (buffer.length < 5 || buffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
        return { valid: false, error: 'File does not match valid PDF magic byte signature (%PDF-)' };
      }
      break;
    }

    case '.png': {
      // Must start with 89 50 4E 47 0D 0A 1A 0A
      const pngHeader = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
      if (buffer.length < 8 || !pngHeader.every((b, i) => buffer[i] === b)) {
        return { valid: false, error: 'File does not match valid PNG magic byte signature' };
      }
      break;
    }

    case '.jpg':
    case '.jpeg': {
      // Must start with FF D8 FF
      if (buffer.length < 3 || buffer[0] !== 0xFF || buffer[1] !== 0xD8 || buffer[2] !== 0xFF) {
        return { valid: false, error: 'File does not match valid JPEG magic byte signature' };
      }
      break;
    }

    case '.docx':
    case '.xlsx': {
      // Must start with PK\x03\x04 (ZIP format)
      if (buffer.length < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4B || buffer[2] !== 0x03 || buffer[3] !== 0x04) {
        return { valid: false, error: 'File does not match valid OpenXML (ZIP) container signature' };
      }

      // Check for macro project entries in header chunk
      const fullBufferStr = buffer.toString('binary');
      if (fullBufferStr.includes('vbaProject.bin') || fullBufferStr.includes('vbaData.xml')) {
        return { valid: false, error: 'Macro-enabled office documents (.docm/.xlsm) are strictly prohibited' };
      }
      break;
    }

    case '.doc':
    case '.xls': {
      // OLE Compound File Binary Format: D0 CF 11 E0 A1 B1 1A E1
      const oleHeader = [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1];
      if (buffer.length < 8 || !oleHeader.every((b, i) => buffer[i] === b)) {
        return { valid: false, error: 'File does not match valid OLE Compound Document signature' };
      }
      break;
    }
  }

  return { valid: true };
}
