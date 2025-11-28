import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/hooks/use-axios-auth';
import { toast } from 'sonner';

export type PaymentMethod = 'paypal' | 'chapa';

export interface PaymentMethodPreference {
  paymentMethodPreference: PaymentMethod;
}

const fetchPaymentMethodPreference = async (): Promise<PaymentMethodPreference> => {
  const response = await api.get('/profile/payment-method-preference');
  return response.data.data;
};

const updatePaymentMethodPreference = async (
  paymentMethodPreference: PaymentMethod
): Promise<PaymentMethodPreference> => {
  const response = await api.put('/profile/payment-method-preference', {
    paymentMethodPreference,
  });
  return response.data.data;
};

export const useGetPaymentMethodPreference = () => {
  return useQuery({
    queryKey: ['payment-method-preference'],
    queryFn: fetchPaymentMethodPreference,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdatePaymentMethodPreference = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePaymentMethodPreference,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-method-preference'] });
      toast.success('Payment method updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update payment method');
    },
  });
};