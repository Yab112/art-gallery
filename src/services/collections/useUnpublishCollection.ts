import useMutationFunc from "@/hooks/use-mutation";
import { toast } from "sonner";
import { collectionKeys } from "@/queries/queryKeys";

interface UnpublishCollectionResponse {
  success: boolean;
  message: string;
}

export const useUnpublishCollection = () => {
  const { mutateAsync, isPending } = useMutationFunc<UnpublishCollectionResponse, never>({
    onSuccess: () => {
      toast.success("Collection unpublished successfully");
    },
    onError: (error) => {
      toast.error("Failed to unpublish collection: " + (error?.message || "An unexpected error occurred"));
    },
    queryKey: collectionKeys.lists(),
  });

  const unpublishCollection = async (id: string) => {
    return mutateAsync({
      url: `/collections/${id}/unpublish`,
      method: "POST",
    });
  };

  return {
    unpublishCollection,
    isUnpublishing: isPending,
  };
};

