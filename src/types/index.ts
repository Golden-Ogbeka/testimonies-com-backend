export interface ResponseError extends Error {
  status?: number;
}

export interface MailContentType {
  recipient: string;
  username: string;
  subject: string;
  email: string;
  attachmentDetails?: EmailAttachmentType;
}

export interface EmailAttachmentType {
  fileBuffer: Buffer;
  fileName: string;
  mimeType: string;
}

export interface CustomPaginateResult<T> {
  docs: T[];
  results: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
  pagingCounter: number;
}

// Export all request types
export * from "./express";
export * from "./requests";
