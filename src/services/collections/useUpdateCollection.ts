import useMutationFunc from "@/hooks/use-mutation"
import { collectionKeys } from "@/queries/queryKeys"
import type { UpdateCollectionDto } from "@/types/collection.types"
import { toast } from "sonner"

interface UpdateCollectionResponse {
    success: boolean
    collection: any
}

export const useUpdateCollection = () => {
    const { mutateAsync, isPending } = useMutationFunc<
        UpdateCollectionResponse,
        UpdateCollectionDto
    >({
        onSuccess: () => {
            toast.success("Collection updated successfully")
        },
        onError: (error) => {
            toast.error(
                `Failed to update collection: ${error?.message || "An unexpected error occurred"}`
            )
        },
        queryKey: collectionKeys.lists()
    })

    const updateCollection = async (id: string, data: UpdateCollectionDto) => {
        return mutateAsync({
            url: `/collections/${id}`,
            method: "PUT",
            body: data
        })
    }

    return {
        updateCollection,
        isUpdating: isPending
    }
}
