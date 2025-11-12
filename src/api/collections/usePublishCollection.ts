import useMutationFunc from "@/hooks/use-mutation";
import { toast } from "sonner";
import { collectionKeys } from "@/queries/queryKeys";

interface PublishCollectionResponse {
  success: boolean;
  message: string;
}

export const usePublishCollection = () => {
  const { mutateAsync, isPending } = useMutationFunc<PublishCollectionResponse, never>({
    onSuccess: (data) => {
      // Check if the response indicates success
      if (data.success) {
        toast.success(data.message || "Collection published successfully");
      } else {
        // Show error message from backend
        toast.error(data.message || "Failed to publish collection");
      }
    },
    onError: (error: any) => {
      // Extract error message from response
      const errorMessage = error?.response?.data?.message || error?.message || "An unexpected error occurred";
      toast.error(errorMessage);
    },
    queryKey: collectionKeys.lists(),
  });

  const publishCollection = async (id: string) => {
    const response = await mutateAsync({
      url: `/collections/${id}/publish`,
      method: "POST",
    });
    
    // If the response indicates failure, throw an error to trigger onError
    if (!response.success) {
      throw new Error(response.message || "Failed to publish collection");
    }
    
    return response;
  };

  return {
    publishCollection,
    isPublishing: isPending,
  };
};

