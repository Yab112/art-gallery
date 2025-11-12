import useMutationFunc from "@/hooks/use-mutation";
import { toast } from "sonner";
import { favoriteKeys, artworkKeys } from "@/queries/queryKeys";

interface RemoveFavoriteResponse {
  success: boolean;
  message: string;
}

export const useRemoveFavorite = () => {
  const { mutateAsync, isPending } = useMutationFunc<RemoveFavoriteResponse, never>({
    onSuccess: () => {
      toast.success("Removed from favorites");
    },
    onError: (error) => {
      toast.error("Failed to remove favorite: " + (error?.message || "An unexpected error occurred"));
    },
    queryKey: favoriteKeys.lists(),
  });

  const removeFavorite = async (artworkId: string) => {
    return mutateAsync({
      url: `/favorites/${artworkId}`,
      method: "DELETE",
    });
  };

  return {
    removeFavorite,
    isRemoving: isPending,
  };
};

