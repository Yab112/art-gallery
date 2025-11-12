import useMutationFunc from "@/hooks/use-mutation";
import { toast } from "sonner";
import { collectionKeys } from "@/queries/queryKeys";

interface DeleteCollectionResponse {
  success: boolean;
  message: string;
}

export const useDeleteCollection = () => {
  const { mutateAsync, isPending } = useMutationFunc<DeleteCollectionResponse, never>({
    onSuccess: () => {
      toast.success("Collection deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete collection: " + (error?.message || "An unexpected error occurred"));
    },
    queryKey: collectionKeys.lists(),
  });

  const deleteCollection = async (id: string) => {
    return mutateAsync({
      url: `/collections/${id}`,
      method: "DELETE",
    });
  };

  return {
    deleteCollection,
    isDeleting: isPending,
  };
};

