import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  payoutAccount: string;
  createdAt: string;
}

export interface WithdrawalsResponse {
  success: boolean;
  data: Withdrawal[];
}

const fetchWithdrawals = async (): Promise<WithdrawalsResponse> => {
  const response = await axios.get(
    `${import.meta.env.VITE_BETTER_AUTH_URL}/api/artist/withdrawals`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    }
  );
  return response.data;
};

export const useGetWithdrawals = () => {
  return useQuery({
    queryKey: ['artist-withdrawals'],
    queryFn: fetchWithdrawals,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
