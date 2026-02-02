// Upload Types
export interface PresignedUrlResponse {
    success: boolean
    presignedUrl: string
    publicUrl: string
    objectKey: string
}

export interface MultiplePresignedUrlsResponse {
    success: boolean
    urls: Array<{
        presignedUrl: string
        publicUrl: string
        objectKey: string
        fileName: string
    }>
}

export interface GeneratePresignedUrlDto {
    fileName: string
    contentType: string
    expirySeconds?: number
}

export interface FileInfo {
    fileName: string
    contentType: string
}

export interface GenerateMultiplePresignedUrlsDto {
    files: FileInfo[]
    expirySeconds?: number
}
