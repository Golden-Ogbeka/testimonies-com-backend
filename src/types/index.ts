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

// Export all request types
export * from "./requests";
