import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useRef } from 'react';

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
  const queryClient = useQueryClient();
  const previousWithdrawalIds = useRef<Set<string>>(new Set());
  
  const query = useQuery({
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

  // Invalidate related queries when a withdrawal status changes to COMPLETED (e.g., via webhook)
  useEffect(() => {
    const currentData = query.data;
    if (currentData?.data) {
      // Track which withdrawals are now COMPLETED that weren't before
      const currentCompletedIds = new Set(
        currentData.data
          .filter(w => w.status === 'COMPLETED')
          .map(w => w.id)
      );
      
      // Check if any withdrawal just became COMPLETED
      const newlyCompleted = Array.from(currentCompletedIds).filter(
        id => !previousWithdrawalIds.current.has(id)
      );
      
      if (newlyCompleted.length > 0) {
        // Invalidate earnings (available balance changes when withdrawal completes)
        queryClient.invalidateQueries({ queryKey: ['artist-earnings'] });
        queryClient.invalidateQueries({ queryKey: ['earnings'] });
        // Invalidate transactions (withdrawal transaction created)
        queryClient.invalidateQueries({ queryKey: ['user-transactions'] });
        queryClient.invalidateQueries({ queryKey: ['user-transaction-stats'] });
      }
      
      // Update previous state
      previousWithdrawalIds.current = currentCompletedIds;
    }
  }, [query.data, queryClient]);

  return query;
};
