import useMutationFunc from "@/hooks/use-mutation";
import { toast } from "sonner";
import { cartKeys } from "@/queries/queryKeys";

interface ClearCartResponse {
  success: boolean;
  message: string;
}

export const useClearCart = () => {
  const { mutateAsync, isPending } = useMutationFunc<ClearCartResponse, never>({
    onSuccess: () => {
      toast.success("Cart cleared");
    },
    onError: (error) => {
      toast.error("Failed to clear cart: " + (error?.message || "An unexpected error occurred"));
    },
    queryKey: cartKeys.lists(),
  });

  const clearCart = async () => {
    return mutateAsync({
      url: "/cart",
      method: "DELETE",
    });
  };

  return {
    clearCart,
    isClearing: isPending,
  };
};

