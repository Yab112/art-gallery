import { useFetchData } from "@/hooks/use-query"
import type { UserProfile } from "@/types/user.types"
import { userKeys } from "./queryKeys"

// Query Hooks
export const useUser = (id: string) => {
    return useFetchData<{ success: boolean; profile: UserProfile }>(
        userKeys.detail(id),
        `profile/${id}`,
        {
            enabled: !!id
        }
    )
}

export const useMyProfile = () => {
    return useFetchData<{ success: boolean; profile: UserProfile }>(userKeys.me(), "profile", {
        staleTime: 0, // Always refetch on mount so address changes are reflected immediately
        refetchOnWindowFocus: false, // Prevent refetch on window focus
        refetchOnMount: true, // Always refetch on mount to get latest data
        retry: 2 // Retry twice on failure
    })
}
