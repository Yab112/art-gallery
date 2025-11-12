import { api } from "@/hooks/use-axios-auth";
import type {
  GeneratePresignedUrlDto,
  GenerateMultiplePresignedUrlsDto,
  PresignedUrlResponse,
  MultiplePresignedUrlsResponse,
} from "@/types/upload.types";

/**
 * Get presigned URL for uploading a single image
 */
export const getPresignedImageUploadUrl = async (
  data: GeneratePresignedUrlDto
): Promise<PresignedUrlResponse> => {
  const response = await api.post<PresignedUrlResponse>(
    "/upload/presigned/image",
    data
  );
  return response.data;
};

/**
 * Get presigned URLs for uploading multiple images
 */
export const getPresignedMultipleImageUploadUrls = async (
  data: GenerateMultiplePresignedUrlsDto
): Promise<MultiplePresignedUrlsResponse> => {
  const response = await api.post<MultiplePresignedUrlsResponse>(
    "/upload/presigned/images",
    data
  );
  return response.data;
};

/**
 * Get presigned URL for uploading a document
 */
export const getPresignedDocumentUploadUrl = async (
  data: GeneratePresignedUrlDto
): Promise<PresignedUrlResponse> => {
  const response = await api.post<PresignedUrlResponse>(
    "/upload/presigned/document",
    data
  );
  return response.data;
};

/**
 * Upload file directly to S3 using presigned URL
 */
export const uploadFileToS3 = async (
  presignedUrl: string,
  file: File
): Promise<void> => {
  const response = await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(
      `Failed to upload file to S3: ${response.status} ${response.statusText}. ${errorText}`
    );
  }
};

