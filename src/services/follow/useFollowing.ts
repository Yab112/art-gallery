import { followKeys } from "@/queries/queryKeys";
import { useFetchData } from "@/hooks/use-query";

interface FollowUser {
  id: string;
  name: string;
  email?: string;
  image?: string;
  bio?: string;
  location?: string;
  website?: string;
  followerCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
}

interface FollowingResponse {
  success: boolean;
  message: string;
  users: FollowUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const useFollowing = (userId: string | undefined, page: number = 1, limit: number = 20) => {
  return useFetchData<FollowingResponse>(
    followKeys.following(userId || "", page, limit),
    userId ? `follow/${userId}/following?page=${page}&limit=${limit}` : "",
    {
      enabled: !!userId,
    }
  );
};

