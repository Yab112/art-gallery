import { useFetchData } from "@/hooks/use-query"
import { followKeys } from "@/queries/queryKeys"

interface FollowStatusResponse {
    success: boolean
    isFollowing: boolean
}

export const useFollowStatus = (userId: string | undefined) => {
    return useFetchData<FollowStatusResponse>(
        followKeys.status(userId || ""),
        userId ? `follow/${userId}/status` : "",
        {
            enabled: !!userId
        }
    )
}
