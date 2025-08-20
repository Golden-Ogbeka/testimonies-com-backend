export interface ResponseError extends Error {
  status?: number;
}

export interface MailContentType {
  recipient: string;
  username: string;
  subject: string;
  email: string;
  attachmentDetails?: {
    fileBuffer: Buffer;
    fileName: string;
    mimeType: string;
  };
}
