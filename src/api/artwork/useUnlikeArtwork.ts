import useMutationFunc from "@/hooks/use-mutation";
import { toast } from "sonner";
import { artworkKeys, favoriteKeys } from "@/queries/queryKeys";

interface UnlikeArtworkResponse {
  success: boolean;
  message: string;
}

export const useUnlikeArtwork = () => {
  const { mutateAsync, isPending } = useMutationFunc<UnlikeArtworkResponse, never>({
    onSuccess: () => {
      toast.success("Artwork unliked");
    },
    onError: (error) => {
      toast.error("Failed to unlike artwork: " + (error?.message || "An unexpected error occurred"));
    },
    queryKey: artworkKeys.lists(),
  });

  const unlikeArtwork = async (id: string) => {
    return mutateAsync({
      url: `/artwork/${id}/like`,
      method: "DELETE",
    });
  };

  return {
    unlikeArtwork,
    isUnliking: isPending,
  };
};

