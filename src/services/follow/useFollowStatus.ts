import { followKeys } from "@/queries/queryKeys";
import { useFetchData } from "@/hooks/use-query";

interface FollowStatusResponse {
  success: boolean;
  isFollowing: boolean;
}

export const useFollowStatus = (userId: string | undefined) => {
  return useFetchData<FollowStatusResponse>(
    followKeys.status(userId || ""),
    userId ? `follow/${userId}/status` : "",
    {
      enabled: !!userId,
    }
  );
};

