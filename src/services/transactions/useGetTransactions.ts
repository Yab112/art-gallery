import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface Transaction {
  id: string;
  orderId: string | null;
  amount: number;
  status: "INITIATED" | "COMPLETED" | "FAILED" | "CANCELLED" | "REFUNDED" | "PROCESSING" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  provider: string | null;
  metadata: any;
  type: "CREDIT" | "DEBIT";
  typeLabel: string;
  order: {
    id: string;
    buyerEmail: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    items: Array<{
      id: string;
      artworkId: string;
      quantity: number;
      price: number;
      artwork: {
        id: string;
        title: string;
        photos: string[];
      };
    }>;
  } | null;
  paymentGateway: {
    id: string;
    name: string;
  } | null;
}

export interface TransactionsResponse {
  success: boolean;
  data: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const fetchTransactions = async (
  page: number = 1,
  limit: number = 20,
  status?: string,
  provider?: string
): Promise<TransactionsResponse> => {
  const params: any = { page, limit };
  if (status) params.status = status;
  if (provider) params.provider = provider;

  const response = await axios.get(
    `${import.meta.env.VITE_BETTER_AUTH_URL}/api/transactions/my-transactions`,
    {
      params,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    }
  );

  // Handle different response formats
  if (response.data.transactions && response.data.pagination) {
    return {
      success: true,
      data: response.data.transactions,
      pagination: response.data.pagination,
    };
  }

  if (response.data.data?.transactions) {
    return {
      success: true,
      data: response.data.data.transactions,
      pagination: response.data.data.pagination || response.data.pagination,
    };
  }

  return {
    success: true,
    data: Array.isArray(response.data) ? response.data : [],
    pagination: {
      page,
      limit,
      total: 0,
      pages: 0,
    },
  };
};

export const useGetTransactions = (
  page: number = 1,
  limit: number = 20,
  status?: string,
  provider?: string
) => {
  return useQuery({
    queryKey: ["user-transactions", page, limit, status, provider],
    queryFn: () => fetchTransactions(page, limit, status, provider),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

