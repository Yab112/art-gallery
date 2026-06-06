import useMutationFunc from "@/hooks/use-mutation"
import type {
    GenerateMultiplePresignedUrlsDto,
    GeneratePresignedUrlDto,
    MultiplePresignedUrlsResponse,
    PresignedUrlResponse
} from "@/types/upload.types"
import { uploadKeys } from "./queryKeys"

// Mutation Hooks (Uploads are mutations, not queries)
export const useGetPresignedImageUploadUrl = () => {
    const { mutateAsync, isPending } = useMutationFunc<
        PresignedUrlResponse,
        GeneratePresignedUrlDto
    >({
        queryKey: uploadKeys.presigned()
    })

    const getPresignedUrl = async (data: GeneratePresignedUrlDto) => {
        return mutateAsync({
            url: "/upload/presigned/image",
            method: "POST",
            body: data
        })
    }

    return {
        mutateAsync: getPresignedUrl,
        isPending
    }
}

export const useGetPresignedMultipleImageUploadUrls = () => {
    const { mutateAsync, isPending } = useMutationFunc<
        MultiplePresignedUrlsResponse,
        GenerateMultiplePresignedUrlsDto
    >({
        queryKey: uploadKeys.presigned()
    })

    const getPresignedUrls = async (data: GenerateMultiplePresignedUrlsDto) => {
        return mutateAsync({
            url: "/upload/presigned/images",
            method: "POST",
            body: data
        })
    }

    return {
        mutateAsync: getPresignedUrls,
        isPending
    }
}

export const useGetPresignedDocumentUploadUrl = () => {
    const { mutateAsync, isPending } = useMutationFunc<
        PresignedUrlResponse,
        GeneratePresignedUrlDto
    >({
        queryKey: uploadKeys.presigned()
    })

    const getPresignedUrl = async (data: GeneratePresignedUrlDto) => {
        return mutateAsync({
            url: "/upload/presigned/document",
            method: "POST",
            body: data
        })
    }

    return {
        mutateAsync: getPresignedUrl,
        isPending
    }
}

export const useGetPresignedVideoUploadUrl = () => {
    const { mutateAsync, isPending } = useMutationFunc<
        PresignedUrlResponse,
        GeneratePresignedUrlDto
    >({
        queryKey: uploadKeys.presigned()
    })

    const getPresignedUrl = async (data: GeneratePresignedUrlDto) => {
        return mutateAsync({
            url: "/upload/presigned/video",
            method: "POST",
            body: data
        })
    }

    return {
        mutateAsync: getPresignedUrl,
        isPending
    }
}
