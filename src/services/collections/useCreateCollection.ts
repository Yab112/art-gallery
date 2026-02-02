import useMutationFunc from "@/hooks/use-mutation"
import { collectionKeys } from "@/queries/queryKeys"
import type { CreateCollectionDto } from "@/types/collection.types"
import { toast } from "sonner"

interface CreateCollectionResponse {
    success: boolean
    collection: any
}

export const useCreateCollection = () => {
    const { mutateAsync, isPending } = useMutationFunc<
        CreateCollectionResponse,
        CreateCollectionDto
    >({
        onSuccess: (data) => {
            toast.success("Collection created successfully")
            return data // Return the response so we can access collection.id
        },
        onError: (error) => {
            toast.error(
                `Failed to create collection: ${error?.message || "An unexpected error occurred"}`
            )
        },
        queryKey: collectionKeys.lists()
    })

    const createCollection = async (data: CreateCollectionDto) => {
        const response = await mutateAsync({
            url: "/collections",
            method: "POST",
            body: data
        })
        return response // Return the response so we can access collection.id
    }

    return {
        createCollection,
        isCreating: isPending
    }
}
