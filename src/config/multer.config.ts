import * as fs from 'fs';
import * as path from 'path';
import { Request } from 'express';
import { HttpStatus } from '@nestjs/common';
import { diskStorage, memoryStorage } from 'multer';
import { MulterModuleAsyncOptions } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { ApiException } from 'src/exceptions/api.exception';

const dest = './uploads';

function isAudioFile(extname: string) {
  const audioExtensions = ['.mp3', '.ogg', '.wav', '.wmv'];
  return audioExtensions.includes(extname.toLowerCase());
}

function isVideoFile(extname: string) {
  const videoExtensions = ['.mp4', '.avi', '.webm', '.mov', '.wmv'];
  return videoExtensions.includes(extname.toLowerCase());
}

export function imageFilter(_req: Request, file: CustomFile, callback: any) {
  const ext = path.extname(file.originalname).replace('.', '');

  if (!file.mimetype.startsWith('image/')) {
    return callback(
      new ApiException(
        'Only images are allowed',
        HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      ),
      false,
    );
  }

  const name = file.originalname.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();

  file.originalname = name;

  file.extension = ext;

  callback(null, true);
}

export function pdfFilter(_req: Request, file: CustomFile, callback: any) {
  const ext = path.extname(file.originalname);

  if (ext !== '.pdf') {
    return callback(
      new ApiException(
        'Only PDF files are allowed',
        HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      ),
      false,
    );
  }

  const name = file.originalname.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();

  file.originalname = name;

  file.extension = ext;

  callback(null, true);
}

export function mediaFilter(_req: Request, file: CustomFile, callback: any) {
  const ext = path.extname(file.originalname).replace('.', '').toLowerCase();
 
  const allowedImageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const allowedVideoExts = ['mp4', 'mov', 'avi', 'webm'];
 
  const isImage =
    file.mimetype.startsWith('image/') && allowedImageExts.includes(ext);
  const isVideo =
    file.mimetype.startsWith('video/') && allowedVideoExts.includes(ext);
 
  if (!isImage && !isVideo) {
    return callback(
      new ApiException(
        `Invalid file type: ${file.mimetype}. Allowed images: ${allowedImageExts.join(', ')}. Allowed videos: ${allowedVideoExts.join(', ')}`,
        HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      ),
      false,
    );
  }
 
  // Prevent a video being uploaded into the images field
  if (file.fieldname === 'images' && isVideo) {
    return callback(
      new ApiException(
        'Videos must be uploaded in the "video" field, not "images"',
        HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      ),
      false,
    );
  }
 
  // Prevent an image being uploaded into the video field
  if (file.fieldname === 'video' && isImage) {
    return callback(
      new ApiException(
        'Images must be uploaded in the "images" field, not "video"',
        HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      ),
      false,
    );
  }
 
  const name = file.originalname.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
 
  file.originalname = name;
  file.extension = ext;
 
  callback(null, true);
}

export function nameFilter(_req: Request, file: CustomFile, callback: any) {
  const ext = path.extname(file.originalname);

  const name = file.originalname.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();

  file.originalname = name;

  file.extension = ext;

  callback(null, true);
}

export function excelFilter(_req: Request, file: CustomFile, callback: any) {
  const ext = path.extname(file.originalname).toLowerCase();

  const allowedExcelExtensions = ['.xls', '.xlsx', '.xlsm', '.csv']; // add .csv if needed

  if (!allowedExcelExtensions.includes(ext)) {
    return callback(
      new ApiException(
        'Only Excel files (.xls, .xlsx, .xlsm) are allowed',
        HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      ),
      false,
    );
  }

  // Clean filename (remove special characters, keep extension)
  const name = file.originalname.replace(/[^a-zA-Z0-9.]/g, '-').toLowerCase();
  file.originalname = name;

  // Store extension without the dot for easier usage later
  file.extension = ext.replace('.', '');

  callback(null, true);
}

const myMemoryStorage = memoryStorage();

const myDiskStorage = diskStorage({
  destination: dest,

  filename: async (req: Request, file: CustomFile, cb) => {
    const extname = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extname);

    let filename = basename + extname;
    let i = 1;
    while (fs.existsSync(`${dest}/${filename}`)) {
      filename = `${basename}(${i++})${extname}`;
    }

    // Set the 'extension' field based on the file extension
    if (isAudioFile(extname)) {
      file.extension = 'audio';
    } else if (isVideoFile(extname)) {
      file.extension = 'video';
    } else {
      file.extension = 'document';
    }

    cb(null, filename);
  },
});

export const diskUpload: MulterOptions = {
  storage: myDiskStorage,
  limits: {
    fileSize: 524288000, // 500MB per file
  },
};

export const memoryUpload: MulterOptions = {
  storage: myMemoryStorage,
  limits: {
    fileSize: 10485760,
  },
};

export const multerConfigAsync: MulterModuleAsyncOptions = {
  useFactory: () => ({
    dest,
  }),
};

export function createStudentFilesFilter(
  _req: Request,
  file: CustomFile,
  callback: any,
) {
  const ext = path.extname(file.originalname).replace('.', '');

  if (
    file.fieldname === 'photos' &&
    !['png', 'jpg', 'gif', 'jpeg'].includes(ext)
  ) {
    return callback(
      new ApiException(
        'Only images are allowed in the photo field',
        HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      ),
      false,
    );
  }

  if (file.fieldname === 'receipts' && ext !== 'pdf') {
    return callback(
      new ApiException(
        'Only PDF files are allowed in the receipts field',
        HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      ),
      false,
    );
  }

  const name = file.originalname.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();

  file.originalname = name;
  file.extension = ext;

  callback(null, true);
}

export function docsImageFilter(
  _req: Request,
  file: CustomFile,
  callback: any,
) {
  const ext = path.extname(file.originalname).toLowerCase();

  const allowedExtensions = [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'webp',
    'pdf',
    'doc',
    'docx', // word
    'xls',
    'xlsx',
    'xlsm',
    'csv',
  ];

  // Corresponding MIME types (more reliable than extension alone)
  const allowedMimeTypes = [
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    // Documents
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    // Excel / Spreadsheets
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel.sheet.macroEnabled.12',
    'text/csv',
    // Sometimes Excel sends this for CSV — optional fallback
    'application/vnd.ms-excel',
  ];

  const fileExt = ext.replace(/^\./, '');

  // Check both extension and mimetype for better security
  const isAllowedExtension = allowedExtensions.includes(fileExt);
  const isAllowedMime = allowedMimeTypes.includes(file.mimetype);

  if (!isAllowedExtension || !isAllowedMime) {
    return callback(
      new ApiException(
        'Invalid file type. Allowed: images (jpg, jpeg, png, gif, webp), PDF, DOCX, XLSX, CSV',
        HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      ),
      false,
    );
  }

  // Sanitize filename (your existing logic)
  const name = file.originalname
    .replace(/[^a-zA-Z0-9.]/g, '-')
    .toLowerCase();

  file.originalname = name;
  file.extension = fileExt;

  callback(null, true);
}

export function getFileDestination(multerFile: CustomFile): string {
  // Prefer the custom extension your filters set (docsImageFilter, excelFilter, etc.)
  let ext =
    (multerFile.extension as string) ||
    path.extname(multerFile.originalname).toLowerCase().replace('.', '');

  const mime = multerFile.mimetype.toLowerCase();

  if (
    mime.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
  ) {
    return '/images';
  }

  if (ext === 'pdf' || mime === 'application/pdf') {
    return '/pdfs';
  }

  // .docx, .doc, etc.
  if (
    ext === 'docx' ||
    ext === 'doc' ||
    mime.includes('wordprocessingml') ||
    mime === 'application/msword'
  ) {
    return '/documents';
  }

  // Fallback for any other allowed file
  return '/documents';
}
