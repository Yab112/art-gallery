import useMutationFunc from "@/hooks/use-mutation"
import { followKeys } from "@/queries/queryKeys"
import { toast } from "sonner"

interface UnfollowUserResponse {
    success: boolean
    message: string
}

export const useUnfollowUser = () => {
    const { mutateAsync, isPending } = useMutationFunc<UnfollowUserResponse, void>({
        onSuccess: () => {
            toast.success("Successfully unfollowed user")
        },
        onError: (error) => {
            toast.error(
                `Failed to unfollow user: ${error?.message || "An unexpected error occurred"}`
            )
        },
        queryKey: followKeys.all()
    })

    const unfollowUser = async (userId: string) => {
        return mutateAsync({
            url: `/follow/${userId}`,
            method: "DELETE"
        })
    }

    return {
        unfollowUser,
        isUnfollowing: isPending
    }
}
