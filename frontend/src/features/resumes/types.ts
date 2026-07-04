export interface Resume {
  id: string;
  originalFilename: string;
  label: string;
  contentType: string;
  sizeBytes: number;
  isActive: boolean;
  createdAt: string;
}

export interface UploadPayload {
  file: File;
  label?: string;
}
