import useMutationFunc from "@/hooks/use-mutation";
import { toast } from "sonner";
import { cartKeys } from "@/queries/queryKeys";

interface RemoveFromCartResponse {
  success: boolean;
  message: string;
}

export const useRemoveFromCart = () => {
  const { mutateAsync, isPending } = useMutationFunc<RemoveFromCartResponse, never>({
    onSuccess: () => {
      toast.success("Removed from cart");
    },
    onError: (error) => {
      toast.error("Failed to remove from cart: " + (error?.message || "An unexpected error occurred"));
    },
    queryKey: cartKeys.lists(),
  });

  const removeFromCart = async (artworkId: string) => {
    return mutateAsync({
      url: `/cart/${artworkId}`,
      method: "DELETE",
    });
  };

  return {
    removeFromCart,
    isRemoving: isPending,
  };
};

