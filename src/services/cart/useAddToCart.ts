import useMutationFunc from "@/hooks/use-mutation";
import { toast } from "sonner";
import { cartKeys } from "@/queries/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import type { AddToCartDto } from "@/types/cart.types";

interface AddToCartResponse {
  success: boolean;
  message: string;
  cartItem: any;
}

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutationFunc<AddToCartResponse, AddToCartDto>({
    onSuccess: () => {
      toast.success("Added to cart");
      // Invalidate all cart-related queries to update count immediately
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
    onError: (error) => {
      toast.error("Failed to add to cart: " + (error?.message || "An unexpected error occurred"));
    },
    queryKey: cartKeys.lists(),
  });

  const addToCart = async (data: AddToCartDto) => {
    return mutateAsync({
      url: "/cart",
      method: "POST",
      body: data,
    });
  };

  return {
    addToCart,
    isAdding: isPending,
  };
};

