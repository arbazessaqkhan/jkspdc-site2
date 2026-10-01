import * as path from 'path';
import * as fs from 'fs';

/**
 * Utility to delete local files uploaded to the 'uploads' folder.
 * Expects a relative URL like '/uploads/filename.ext'.
 */
export function deleteLocalFile(url: string | null | undefined): void {
  if (!url || typeof url !== 'string') return;
  
  // Only target files served from our static /uploads path
  if (!url.startsWith('/uploads/')) return;

  const filename = url.replace('/uploads/', '');
  // Prevent directory traversal attacks
  const safeFilename = path.basename(filename);
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  const filePath = path.resolve(uploadsDir, safeFilename);

  if (!filePath.startsWith(uploadsDir + path.sep)) {
    console.error(`[File Cleanup] Path traversal attempt blocked: ${url}`);
    return;
  }

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`[File Cleanup] Deleted file from disk: ${filePath}`);
    } else {
      console.log(`[File Cleanup] File does not exist on disk: ${filePath}`);
    }
  } catch (err) {
    console.error(`[File Cleanup] Error deleting file: ${filePath}`, err);
  }
}
