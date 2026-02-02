import { useFetchData } from "@/hooks/use-query"
import { followKeys } from "@/queries/queryKeys"

interface FollowCountsResponse {
    success: boolean
    followerCount: number
    followingCount: number
}

export const useFollowCounts = (userId: string | undefined) => {
    return useFetchData<FollowCountsResponse>(
        followKeys.counts(userId || ""),
        userId ? `follow/${userId}/counts` : "",
        {
            enabled: !!userId
        }
    )
}
