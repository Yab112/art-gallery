import { useFetchData } from "@/hooks/use-query";
import { userKeys } from "./queryKeys";
import type { UserProfile } from "@/types/user.types";

// Query Hooks
export const useUser = (id: string) => {
  return useFetchData<{ success: boolean; profile: UserProfile }>(
    userKeys.detail(id),
    `profile/${id}`,
    {
      enabled: !!id,
    }
  );
};

export const useMyProfile = () => {
  return useFetchData<{ success: boolean; profile: UserProfile }>(
    userKeys.me(),
    "profile"
  );
};
