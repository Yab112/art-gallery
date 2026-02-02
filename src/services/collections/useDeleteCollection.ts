import useMutationFunc from "@/hooks/use-mutation"
import { collectionKeys } from "@/queries/queryKeys"
import { toast } from "sonner"

interface DeleteCollectionResponse {
    success: boolean
    message: string
}

export const useDeleteCollection = () => {
    const { mutateAsync, isPending } = useMutationFunc<DeleteCollectionResponse, never>({
        onSuccess: () => {
            toast.success("Collection deleted successfully")
        },
        onError: (error) => {
            toast.error(
                `Failed to delete collection: ${error?.message || "An unexpected error occurred"}`
            )
        },
        queryKey: collectionKeys.lists()
    })

    const deleteCollection = async (id: string) => {
        return mutateAsync({
            url: `/collections/${id}`,
            method: "DELETE"
        })
    }

    return {
        deleteCollection,
        isDeleting: isPending
    }
}
