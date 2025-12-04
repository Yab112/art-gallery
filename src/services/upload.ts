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
 * Important: The Content-Type header must match exactly what was used to generate the presigned URL
 */
export const uploadFileToS3 = async (
  presignedUrl: string,
  file: File,
  contentType?: string
): Promise<void> => {
  try {
    // Use the provided contentType or fallback to file.type
    // CRITICAL: The Content-Type must match exactly what was used to generate the presigned URL
    const uploadContentType = contentType || file.type;

    // Create a new URL to parse and ensure we're using it correctly
    const url = new URL(presignedUrl);
    
    // Log for debugging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('Uploading to S3:', {
        url: url.origin + url.pathname,
        contentType: uploadContentType,
        fileSize: file.size,
        fileName: file.name,
      });
    }

    const response = await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": uploadContentType,
        // DO NOT add any other headers - the presigned URL already includes all necessary auth headers
        // Adding extra headers will cause the signature to be invalid
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      const errorDetails = {
        status: response.status,
        statusText: response.statusText,
        errorText,
        contentType: uploadContentType,
        fileSize: file.size,
        fileName: file.name,
      };
      
      console.error("S3 Upload Error:", errorDetails);
      
      // Provide more helpful error messages
      if (response.status === 403) {
        throw new Error(
          `S3 Upload failed: Access denied. The presigned URL may have expired or the Content-Type doesn't match. ${errorText}`
        );
      } else if (response.status === 400) {
        throw new Error(
          `S3 Upload failed: Bad request. Check that the Content-Type (${uploadContentType}) matches the presigned URL. ${errorText}`
        );
      } else {
        throw new Error(
          `Failed to upload file to S3: ${response.status} ${response.statusText}. ${errorText}`
        );
      }
    }
  } catch (error: any) {
    // Re-throw if it's already our formatted error
    if (error.message && error.message.includes('S3 Upload failed')) {
      throw error;
    }
    
    console.error("S3 Upload Exception:", error);
    throw new Error(
      `Failed to upload file to S3: ${error.message || 'Unknown error'}`
    );
  }
};

