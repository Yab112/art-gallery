import useMutationFunc from "@/hooks/use-mutation";
import { toast } from "sonner";
import { collectionKeys } from "@/queries/queryKeys";
import type { CreateCollectionDto } from "@/types/collection.types";

interface UpdateCollectionResponse {
  success: boolean;
  collection: any;
}

export const useUpdateCollection = () => {
  const { mutateAsync, isPending } = useMutationFunc<UpdateCollectionResponse, CreateCollectionDto>({
    onSuccess: () => {
      toast.success("Collection updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update collection: " + (error?.message || "An unexpected error occurred"));
    },
    queryKey: collectionKeys.lists(),
  });

  const updateCollection = async (id: string, data: CreateCollectionDto) => {
    return mutateAsync({
      url: `/collections/${id}`,
      method: "PUT",
      body: data,
    });
  };

  return {
    updateCollection,
    isUpdating: isPending,
  };
};

