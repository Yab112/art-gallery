import useMutationFunc from "@/hooks/use-mutation"
import { userKeys } from "@/queries/queryKeys"
import { toast } from "sonner"

interface UpdateAvatarResponse {
    success: boolean
    avatarUrl: string
}

export const useUpdateAvatar = () => {
    const { mutateAsync, isPending } = useMutationFunc<UpdateAvatarResponse, { avatarUrl: string }>(
        {
            onSuccess: () => {
                toast.success("Avatar updated successfully")
            },
            onError: (error) => {
                toast.error(
                    `Failed to update avatar: ${error?.message || "An unexpected error occurred"}`
                )
            },
            queryKey: userKeys.me()
        }
    )

    const updateAvatar = async (avatarUrl: string) => {
        return mutateAsync({
            url: "/profile/avatar",
            method: "PUT",
            body: { avatarUrl }
        })
    }

    return {
        updateAvatar,
        isUpdating: isPending
    }
}
