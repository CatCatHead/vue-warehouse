// src/api/upload.ts
import { http } from "@/utils/request";

export interface UploadResponse {
  id: string;
  filename: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  url: string;
  uploadTime: string;
}

export const uploadApi = {
  uploadFile(
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    return http.upload("/upload/single", formData, onProgress);
  },

  uploadFiles(
    files: File[],
    onProgress?: (progress: number) => void,
  ): Promise<UploadResponse[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    return http.upload("/upload/multiple", formData, onProgress);
  },

  deleteFile(fileId: string): Promise<void> {
    return http.delete(`/upload/files/${fileId}`);
  },
};
