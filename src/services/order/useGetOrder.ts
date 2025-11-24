import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface OrderItem {
  id: string;
  artworkId: string;
  quantity: number;
  price: number;
  artwork?: {
    id: string;
    title: string;
    imageUrl: string;
  };
}

export interface Order {
  id: string;
  buyerEmail: string;
  buyerPhone?: string;
  shippingAddress?: string;
  totalAmount: number;
  status: string;
  items: OrderItem[];
  transaction?: {
    id: string;
    amount: number;
    status: string;
    metadata: {
      subtotal: number;
      platformFee: number;
      platformCommissionRate: number;
      txRef?: string;
      paymentProvider?: string;
    };
  };
  createdAt: string;
}

const fetchOrder = async (orderId: string): Promise<Order> => {
  const response = await axios.get(
    `${import.meta.env.VITE_BETTER_AUTH_URL}/api/orders/${orderId}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    }
  );
  return response.data;
};

export const useGetOrder = (orderId: string | null) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrder(orderId!),
    enabled: !!orderId,
    retry: 2,
  });
};
