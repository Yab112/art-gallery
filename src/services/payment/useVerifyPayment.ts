import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export interface VerifyPaymentParams {
  provider: 'chapa' | 'paypal';
  txRef: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  data: {
    status: string;
    amount: number;
    currency: string;
    txRef: string;
    provider: string;
    chargeResponseMessage?: string;
    customerEmail?: string;
    customerName?: string;
    originalTxRef?: string; // For PayPal: original TX-{orderId}-{timestamp} format
  };
}

const verifyPayment = async (params: VerifyPaymentParams): Promise<VerifyPaymentResponse> => {
  const response = await axios.post(
    `${import.meta.env.VITE_BETTER_AUTH_URL}/api/payment/verify`,
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

export const useVerifyPayment = () => {
  return useMutation({
    mutationFn: verifyPayment,
    onSuccess: (data) => {
      console.log('Payment verified:', data);
    },
    onError: (error: any) => {
      console.error('Payment verification failed:', error);
    },
  });
};
