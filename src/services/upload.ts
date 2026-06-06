import axios from "axios";
import { api } from "@/hooks/use-axios-auth";
import type {
  GenerateMultiplePresignedUrlsDto,
  GeneratePresignedUrlDto,
  MultiplePresignedUrlsResponse,
  PresignedUrlResponse,
} from "@/types/upload.types";

/**
 * Get presigned URL for uploading a single image
 */
export const getPresignedImageUploadUrl = async (
  data: GeneratePresignedUrlDto,
): Promise<PresignedUrlResponse> => {
  const response = await api.post<PresignedUrlResponse>(
    "/upload/presigned/image",
    data,
  );
  return response.data;
};

/**
 * Get presigned URLs for uploading multiple images
 */
export const getPresignedMultipleImageUploadUrls = async (
  data: GenerateMultiplePresignedUrlsDto,
): Promise<MultiplePresignedUrlsResponse> => {
  const response = await api.post<MultiplePresignedUrlsResponse>(
    "/upload/presigned/images",
    data,
  );
  return response.data;
};

/**
 * Get presigned URL for uploading a document
 */
export const getPresignedDocumentUploadUrl = async (
  data: GeneratePresignedUrlDto,
): Promise<PresignedUrlResponse> => {
  const response = await api.post<PresignedUrlResponse>(
    "/upload/presigned/document",
    data,
  );
  return response.data;
};

/**
 * Upload file directly to S3 using presigned URL
 * Important: The Content-Type header must match exactly what was used to generate the presigned URL
 */
export const uploadFileToS3 = async (
  presignedUrl: string,
  file: File,
  contentType?: string,
  onProgress?: (percentage: number) => void,
): Promise<void> => {
  const uploadContentType = contentType || file.type;
  try {
    // Log for debugging (remove in production)
    if (process.env.NODE_ENV === "development") {
      console.log("Uploading to S3:", {
        url: presignedUrl.split("?")[0], // Log URL without query params for privacy
        contentType: uploadContentType,
        fileSize: file.size,
        fileName: file.name,
      });
    }

    await axios.put(presignedUrl, file, {
      headers: {
        "Content-Type": uploadContentType,
        // DO NOT add any other headers - the presigned URL already includes all necessary auth headers
        // Adding extra headers will cause the signature to be invalid
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentage = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(percentage);
        }
      },
    });
  } catch (error: any) {
    console.error("S3 Upload Exception:", error);

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const status = error.response.status;

      if (status === 403) {
        throw new Error(
          `S3 Upload failed: Access denied. The presigned URL may have expired or the Content-Type doesn't match.`,
        );
      } else if (status === 400) {
        throw new Error(
          `S3 Upload failed: Bad request. Check that the Content-Type (${uploadContentType}) matches the presigned URL.`,
        );
      } else {
        throw new Error(
          `Failed to upload file to S3: ${status} ${error.response.statusText}`,
        );
      }
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error("Failed to upload file to S3: No response from server");
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(
        `Failed to upload file to S3: ${error.message || "Unknown error"}`,
      );
    }
  }
};
