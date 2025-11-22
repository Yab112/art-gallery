import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface PaymentMethod {
  accountHolder: string;
  iban: string;
  bicCode: string | null;
}

export interface PaymentMethodsResponse {
  success: boolean;
  data: PaymentMethod[];
}

const fetchPaymentMethods = async (): Promise<PaymentMethodsResponse> => {
  const response = await axios.get(
    `${import.meta.env.VITE_BETTER_AUTH_URL}/api/artist/payment-methods`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    }
  );
  return response.data;
};

export const useGetPaymentMethods = () => {
  return useQuery({
    queryKey: ['artist-payment-methods'],
    queryFn: fetchPaymentMethods,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
