import useMutationFunc from "@/hooks/use-mutation";
import { toast } from "sonner";
import { cartKeys } from "@/queries/queryKeys";

interface UpdateCartItemResponse {
  success: boolean;
  message: string;
  item: any;
}

export const useUpdateCartItem = () => {
  const { mutateAsync, isPending } = useMutationFunc<UpdateCartItemResponse, { quantity: number }>({
    onSuccess: () => {
      toast.success("Cart updated");
    },
    onError: (error) => {
      toast.error("Failed to update cart: " + (error?.message || "An unexpected error occurred"));
    },
    queryKey: cartKeys.lists(),
  });

  const updateCartItem = async (artworkId: string, quantity: number) => {
    return mutateAsync({
      url: `/cart/${artworkId}`,
      method: "PUT",
      body: { quantity },
    });
  };

  return {
    updateCartItem,
    isUpdating: isPending,
  };
};

