import useMutationFunc from "@/hooks/use-mutation"
import { followKeys } from "@/queries/queryKeys"
import { toast } from "sonner"

interface FollowUserResponse {
    success: boolean
    message: string
    follow?: any
}

export const useFollowUser = () => {
    const { mutateAsync, isPending } = useMutationFunc<FollowUserResponse, void>({
        onSuccess: () => {
            toast.success("Successfully followed user")
        },
        onError: (error) => {
            toast.error(
                `Failed to follow user: ${error?.message || "An unexpected error occurred"}`
            )
        },
        queryKey: followKeys.all()
    })

    const followUser = async (userId: string) => {
        return mutateAsync({
            url: `/follow/${userId}`,
            method: "POST"
        })
    }

    return {
        followUser,
        isFollowing: isPending
    }
}
