import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/hooks/use-axios-auth";

export interface OrderItem {
  id: string;
  orderId: string;
  artworkId: string;
  quantity: number;
  price: number;
  artwork?: {
    id: string;
    title?: string;
    artist?: string;
    photos?: string[];
    desiredPrice?: number;
    user?: {
      id: string;
      name?: string;
      email?: string;
    };
  };
}

export interface Order {
  id: string;
  buyerEmail: string;
  totalAmount: number | string;
  status: "PENDING" | "PAID" | "CANCELLED" | "REFUNDED";
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  transaction?: {
    id: string;
    status: string;
    amount: number | string;
    metadata?: any;
  };
}

export interface OrdersResponse {
  orders: Order[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Get authenticated user's orders
 * Uses the secure endpoint that fetches orders by authenticated user ID
 */
export const useUserOrders = () => {
  const axiosAuth = useAxiosAuth();

  return useQuery<Order[]>({
    queryKey: ["user-orders"],
    queryFn: async () => {
      try {
        console.log("Fetching orders for authenticated user");
        const response = await axiosAuth.get<Order[]>(`orders/my-orders`);
        
        console.log("Orders API response:", response.data);
        
        // Backend returns array directly
        if (Array.isArray(response.data)) {
          console.log(`Found ${response.data.length} orders`);
          return response.data;
        }
        
        // If wrapped in data property
        if (response.data && typeof response.data === 'object' && 'data' in response.data) {
          const data = (response.data as any).data;
          if (Array.isArray(data)) {
            console.log(`Found ${data.length} orders in data property`);
            return data;
          }
        }
        
        // If wrapped in orders property
        if (response.data && typeof response.data === 'object' && 'orders' in response.data) {
          const orders = (response.data as any).orders;
          if (Array.isArray(orders)) {
            console.log(`Found ${orders.length} orders in orders property`);
            return orders;
          }
        }
        
        console.warn("Orders response format unexpected:", response.data);
        return [];
      } catch (error: any) {
        console.error("Failed to fetch orders:", error);
        console.error("Error details:", {
          message: error?.message,
          response: error?.response?.data,
          status: error?.response?.status,
        });
        // Return empty array on error instead of throwing
        return [];
      }
    },
    staleTime: 0, // Always consider data stale - refetch on mount
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
    retry: 2,
  });
};

