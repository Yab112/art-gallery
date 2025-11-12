import useMutationFunc from "@/hooks/use-mutation";
import { toast } from "sonner";
import { favoriteKeys, artworkKeys } from "@/queries/queryKeys";

interface AddFavoriteResponse {
  success: boolean;
  message: string;
  favorite: any;
}

export const useAddFavorite = () => {
  const { mutateAsync, isPending } = useMutationFunc<AddFavoriteResponse, { artworkId: string }>({
    onSuccess: () => {
      toast.success("Added to favorites");
    },
    onError: (error) => {
      toast.error("Failed to add favorite: " + (error?.message || "An unexpected error occurred"));
    },
    queryKey: favoriteKeys.lists(),
  });

  const addFavorite = async (artworkId: string) => {
    return mutateAsync({
      url: "/favorites",
      method: "POST",
      body: { artworkId },
    });
  };

  return {
    addFavorite,
    isAdding: isPending,
  };
};

