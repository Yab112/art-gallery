import useAxiosAuth from "@/hooks/use-axios-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface ConfirmDeliveryParams {
  orderId: string;
  signatureDataUrl?: string;
  acceptedTerms: boolean;
  hasDispute: boolean;
  disputeReason?: string;
  disputeNote?: string;
  attachmentDataUrl?: string;
}

export interface DeliveryConfirmation {
  id: string;
  orderId: string;
  buyerId: string;
  signatureUrl: string;
  acceptedTerms: boolean;
  hasDispute: boolean;
  disputeReason: string | null;
  disputeNote: string | null;
  confirmedAt: string;
}

export const useConfirmDelivery = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  return useMutation<any, Error, ConfirmDeliveryParams>({
    mutationFn: async (params) => {
      const response = await axiosAuth.post("delivery-confirmation", params);
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.orderId] });
      queryClient.invalidateQueries({
        queryKey: ["delivery-confirmation", variables.orderId],
      });
      queryClient.invalidateQueries({
        queryKey: ["order-shipment", variables.orderId],
      });
    },
  });
};

export const useDeliveryConfirmation = (orderId: string | undefined) => {
  const axiosAuth = useAxiosAuth();

  return useQuery<DeliveryConfirmation | null, Error>({
    queryKey: ["delivery-confirmation", orderId],
    queryFn: async () => {
      if (!orderId) return null;
      try {
        const response = await axiosAuth.get<DeliveryConfirmation>(
          `delivery-confirmation/${orderId}`
        );
        return response.data;
      } catch (err: any) {
        if (err?.response?.status === 404) {
          return null;
        }
        throw err;
      }
    },
    enabled: !!orderId,
    retry: 1,
  });
};
