import useMutationFunc from "@/hooks/use-mutation";
import { toast } from "sonner";
import { artworkKeys } from "@/queries/queryKeys";
import type { CreateArtworkDto } from "@/types/artwork.types";

interface CreateArtworkResponse {
  success: boolean;
  message: string;
  artworkId: string;
  artwork: any;
}

export const useCreateArtwork = () => {
  const { mutateAsync, isPending } = useMutationFunc<
    CreateArtworkResponse,
    CreateArtworkDto
  >({
    onSuccess: (data) => {
      // Check if the response indicates success
      if (data.success) {
        toast.success(data.message || "Artwork created successfully");
      } else {
        // Show error message from backend
        toast.error(data.message || "Failed to create artwork");
      }
    },
    onError: (error) => {
      toast.error(
        "Failed to create artwork: " +
          (error?.message || "An unexpected error occurred")
      );
    },
    queryKey: artworkKeys.lists(),
  });

  const createArtwork = async (data: CreateArtworkDto) => {
    const response = await mutateAsync({
      url: "/artwork/submit",
      method: "POST",
      body: data,
    });

    // If the response indicates failure, throw an error to trigger onError
    if (!response.success) {
      throw new Error(response.message || "Failed to create artwork");
    }

    return response;
  };

  return {
    createArtwork,
    isCreating: isPending,
  };
};
