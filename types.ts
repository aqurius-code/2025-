export interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export interface GenerationResult {
  text: string;
  timestamp: number;
}
