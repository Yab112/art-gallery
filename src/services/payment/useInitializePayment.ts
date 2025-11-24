import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export interface InitializePaymentParams {
  provider: 'chapa' | 'paypal' | 'card';
  amount: number;
  currency?: 'ETB' | 'USD';
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  orderId?: string;
  txRef: string;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  data: {
    checkoutUrl: string;
    txRef: string;
    provider: string;
  };
}

const initializePayment = async (params: InitializePaymentParams): Promise<PaymentResponse> => {
  const response = await axios.post(
    `${import.meta.env.VITE_BETTER_AUTH_URL}/api/payment/initialize`,
    params,
    {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    }
  );
  return response.data;
};

export const useInitializePayment = () => {
  return useMutation({
    mutationFn: initializePayment,
    onSuccess: (data) => {
      // Redirect to checkout URL
      if (data.success && data.data.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
      }
    },
    onError: (error: any) => {
      console.error('Payment initialization failed:', error);
    },
  });
};
