import { useFetchData } from "@/hooks/use-query"
import { followKeys } from "./queryKeys"

export interface FollowUser {
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

export interface FollowListResponse {
    success: boolean
    message: string
    users: FollowUser[]
    total: number
    page: number
    limit: number
    totalPages: number
}

export interface FollowStatusResponse {
    success: boolean
    isFollowing: boolean
}

export interface FollowCountsResponse {
    success: boolean
    followerCount: number
    followingCount: number
}

// Query Hooks
export const useFollowers = (userId: string | undefined, page = 1, limit = 20) => {
    return useFetchData<FollowListResponse>(
        followKeys.followers(userId || "", page, limit),
        userId ? `follow/${userId}/followers?page=${page}&limit=${limit}` : null,
        {
            enabled: !!userId
        }
    )
}

export const useFollowing = (userId: string | undefined, page = 1, limit = 20) => {
    return useFetchData<FollowListResponse>(
        followKeys.following(userId || "", page, limit),
        userId ? `follow/${userId}/following?page=${page}&limit=${limit}` : null,
        {
            enabled: !!userId
        }
    )
}

export const useFollowStatus = (userId: string | undefined) => {
    return useFetchData<FollowStatusResponse>(
        followKeys.status(userId || ""),
        userId ? `follow/${userId}/status` : null,
        {
            enabled: !!userId
        }
    )
}

export const useFollowCounts = (userId: string | undefined) => {
    return useFetchData<FollowCountsResponse>(
        followKeys.counts(userId || ""),
        userId ? `follow/${userId}/counts` : null,
        {
            enabled: !!userId
        }
    )
}
