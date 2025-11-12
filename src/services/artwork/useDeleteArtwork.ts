import useMutationFunc from "@/hooks/use-mutation";
import { toast } from "sonner";
import { artworkKeys } from "@/queries/queryKeys";

interface DeleteArtworkResponse {
  success: boolean;
  message: string;
}

export const useDeleteArtwork = () => {
  const { mutateAsync, isPending } = useMutationFunc<DeleteArtworkResponse, never>({
    onSuccess: () => {
      toast.success("Artwork deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete artwork: " + (error?.message || "An unexpected error occurred"));
    },
    queryKey: artworkKeys.lists(),
  });

  const deleteArtwork = async (id: string) => {
    return mutateAsync({
      url: `/artwork/${id}`,
      method: "DELETE",
    });
  };

  return {
    deleteArtwork,
    isDeleting: isPending,
  };
};

