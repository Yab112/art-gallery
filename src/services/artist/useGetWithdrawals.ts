import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface Withdrawal {
  id: string;
  amount: number;
  status: string; // System status (PROCESSING, INITIATED, etc.)
  paypalStatus?: string | null; // Actual PayPal transaction status (SUCCESS, UNCLAIMED, etc.)
  payoutAccount: string;
  createdAt: string;
  rejectionReason?: string | null;
}

export interface WithdrawalsResponse {
  success: boolean;
  data: Withdrawal[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const fetchWithdrawals = async (page: number = 1, limit: number = 20): Promise<WithdrawalsResponse> => {
  const response = await axios.get(
    `${import.meta.env.VITE_BETTER_AUTH_URL}/api/artist/withdrawals`,
    {
      params: {
        page,
        limit,
      },
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    }
  );
  return response.data;
};

export const useGetWithdrawals = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ['artist-withdrawals', page, limit],
    queryFn: () => fetchWithdrawals(page, limit),
    staleTime: 0, // Always consider data stale, refetch on mount/window focus
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: (query) => {
      // If there are any PROCESSING withdrawals, poll every 30 seconds
      const data = query.state.data as WithdrawalsResponse | undefined;
      const hasProcessing = data?.data?.some(w => w.status === 'PROCESSING' || w.status === 'INITIATED');
      return hasProcessing ? 30 * 1000 : false; // Poll every 30s if processing, otherwise don't poll
    },
  });
};
