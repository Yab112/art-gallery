import { followKeys } from "@/queries/queryKeys";
import { useFetchData } from "@/hooks/use-query";

interface FollowCountsResponse {
  success: boolean;
  followerCount: number;
  followingCount: number;
}

export const useFollowCounts = (userId: string | undefined) => {
  return useFetchData<FollowCountsResponse>(
    followKeys.counts(userId || ""),
    userId ? `follow/${userId}/counts` : "",
    {
      enabled: !!userId,
    }
  );
};

