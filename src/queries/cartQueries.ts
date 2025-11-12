import { useFetchData } from "@/hooks/use-query";
import { cartKeys } from "./queryKeys";
import type { CartListResponse, CartSummary } from "@/types/cart.types";

// Query Hooks
export const useCartItems = (page: number = 1, limit: number = 10) => {
  return useFetchData<CartListResponse>(
    cartKeys.list(page, limit),
    `cart?page=${page}&limit=${limit}`
  );
};

export const useCartSummary = () => {
  return useFetchData<CartSummary>(cartKeys.summary(), "cart/summary");
};
