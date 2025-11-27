import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface TransactionStats {
  byDate: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
  byStatus: Record<string, { count: number; amount: number }>;
  byProvider: Record<string, { count: number; amount: number }>;
  totalAmount: number;
  totalCount: number;
}

const fetchTransactionStats = async (
  period: "week" | "month" | "year" = "month"
): Promise<TransactionStats> => {
  const response = await axios.get(
    `${import.meta.env.VITE_BETTER_AUTH_URL}/api/transactions/my-transactions/stats`,
    {
      params: { period },
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    }
  );

  return response.data;
};

export const useGetTransactionStats = (
  period: "week" | "month" | "year" = "month"
) => {
  return useQuery({
    queryKey: ["user-transaction-stats", period],
    queryFn: () => fetchTransactionStats(period),
    staleTime: 0, // Always refetch to ensure fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};

