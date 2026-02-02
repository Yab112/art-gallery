import { useFetchData } from "@/hooks/use-query"
import { followKeys } from "@/queries/queryKeys"

interface FollowUser {
    id: string
    name: string
    email?: string
    image?: string
    bio?: string
    location?: string
    website?: string
    followerCount?: number
    followingCount?: number
    isFollowing?: boolean
}

interface FollowersResponse {
    success: boolean
    message: string
    users: FollowUser[]
    total: number
    page: number
    limit: number
    totalPages: number
}

export const useFollowers = (userId: string | undefined, page = 1, limit = 20) => {
    return useFetchData<FollowersResponse>(
        followKeys.followers(userId || "", page, limit),
        userId ? `follow/${userId}/followers?page=${page}&limit=${limit}` : "",
        {
            enabled: !!userId
        }
    )
}
