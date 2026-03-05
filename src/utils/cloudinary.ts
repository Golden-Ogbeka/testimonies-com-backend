import { v2 as cloudinary } from "cloudinary";
import * as dotenv from "dotenv";
import { NextFunction, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { PRODUCT_NAME } from "../functions/env";
import { sendErrorFeedback } from "../functions/feedback";
import { CustomRequest } from "../types";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// File Filter for Images
const imageFileFilter = (
  req: CustomRequest,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  const allowedMimeTypes = ["image/png", "image/jpg", "image/jpeg"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Only JPG, PNG, and JPEG are allowed. Your file type is ${file.mimetype}`,
      ),
    );
  }
};

// File Filter for Documents
const documentFileFilter = (
  req: CustomRequest,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  // Allowing both images and documents
  const allowedMimeTypes = [
    // images
    "image/png",
    "image/jpg",
    "image/jpeg",

    // documents
    "application/pdf",
    "application/doc",
    "application/docx",
    "application/xls",
    "application/xlsx",
    "application/ppt",
    "application/pptx",
    "text/plain",
    "text/csv",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Only image and document files are allowed. Your file type is ${file.mimetype}`,
      ),
    );
  }
};

// File Filter for Media (Images and Videos)
const mediaFileFilter = (
  req: CustomRequest,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  const allowedMimeTypes = [
    // Images
    "image/png",
    "image/jpg",
    "image/jpeg",
    // Videos
    "video/mp4",
    "video/mpeg",
    "video/x-msvideo",
    "video/x-matroska",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Only images (JPG, PNG, JPEG) and videos (MP4, MPEG, AVI, MKV) are allowed. Your file type is ${file.mimetype}`,
      ),
    );
  }
};

// File Filter for Media with count limit
const testimonyMediaFileFilter = (
  req: CustomRequest,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  // Initialize file count if not exists
  if (!req.fileCount) req.fileCount = 0;

  // Increment count for each file
  req.fileCount++;

  // Check if exceeds limit
  if (req.fileCount > 4) {
    return cb(new Error("Maximum 4 files allowed"));
  }

  // Check file type
  const allowedMimeTypes = [
    // Images
    "image/png",
    "image/jpg",
    "image/jpeg",
    // Videos
    "video/mp4",
    "video/mpeg",
    "video/x-msvideo",
    "video/x-matroska",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Only images (JPG, PNG, JPEG) and videos (MP4, MPEG, AVI, MKV) are allowed. Your file type is ${file.mimetype}`,
      ),
    );
  }
};

// File Filter for Videos
const videoFileFilter = (
  req: CustomRequest,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  const allowedMimeTypes = [
    "video/mp4",
    "video/mpeg",
    "video/x-msvideo",
    "video/x-matroska",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Only MP4, MPEG, AVI, and MKV are allowed. Your file type is ${file.mimetype}`,
      ),
    );
  }
};

const CLOUDINARY_FOLDER = PRODUCT_NAME || "default_folder";
const ALLOWED_FORMATS = [
  // pictures
  "jpg",
  "png",
  "jpeg",
  "jfif",
  "pjpeg",
  "pjp",
  // videos
  "mp4",
  "avi",
  "mkv",
  // documents
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "txt",
  "csv",
];

const cloudStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith("video");
    const isDocument = file.mimetype.startsWith("application");
    const subFolder = isVideo ? "videos" : isDocument ? "documents" : "images";
    return {
      folder: `${CLOUDINARY_FOLDER}/${subFolder}`,
      format: ALLOWED_FORMATS.includes(file.mimetype.split("/")[1])
        ? file.mimetype.split("/")[1]
        : undefined,
      allowed_formats: ALLOWED_FORMATS,
      resource_type: isVideo ? "video" : isDocument ? "raw" : "image",
      public_id: `${Date.now()}_${file.originalname.replace(" ", "_")}`,
    };
  },
});

const imageParser = multer({
  storage: cloudStorage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5mb limit
  },
  fileFilter: imageFileFilter,
});

const documentParser = multer({
  storage: cloudStorage,
  limits: {
    fileSize: 1024 * 1024 * 20, // 20mb limit
  },
  fileFilter: documentFileFilter,
});

const mediaParser = multer({
  storage: cloudStorage,
  limits: {
    fileSize: 1024 * 1024 * 50, // 50mb limit for media files
  },
  fileFilter: mediaFileFilter,
});

const testimonyMediaParser = multer({
  storage: cloudStorage,
  limits: {
    fileSize: 1024 * 1024 * 50, // 50mb limit for media files
  },
  fileFilter: testimonyMediaFileFilter,
});

const videoParser = multer({
  storage: cloudStorage,
  limits: {
    fileSize: 1024 * 1024 * 100, // 100mb limit
  },
  fileFilter: videoFileFilter,
});

const multerErrorHandler = (
  err: unknown,
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    sendErrorFeedback(res, 400, `File upload error: ${err.message}`);
  } else if (err instanceof Error) {
    // General errors
    sendErrorFeedback(res, 400, err.message);
  } else if (err) {
    sendErrorFeedback(res, 400, "An unknown error occurred during file upload");
  } else {
    next();
  }
};

export {
  documentParser,
  imageParser,
  mediaParser,
  multerErrorHandler,
  testimonyMediaParser,
  videoParser,
};
