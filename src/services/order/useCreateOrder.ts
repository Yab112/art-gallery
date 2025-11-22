import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export interface OrderItem {
  artworkId: string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

export interface CreateOrderParams {
  buyerEmail: string;
  shippingAddress: ShippingAddress;
  paymentMethod: 'chapa' | 'paypal' | 'card';
  items: OrderItem[];
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  data: {
    orderId: string;
    txRef: string;
    totalAmount: number;
    subtotal: number;
    platformFee: number;
  };
}

const createOrder = async (params: CreateOrderParams): Promise<CreateOrderResponse> => {
  const response = await axios.post(
    `${import.meta.env.VITE_BETTER_AUTH_URL}/api/orders/create`,
    params,
    {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    }
  );

  return {
    success: true,
    message: 'Order created successfully',
    data: response.data,
  };
};

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: createOrder,
    onSuccess: (data) => {
      console.log('Order created successfully:', data);
    },
    onError: (error: any) => {
      console.error('Order creation failed:', error);
    },
  });
};
