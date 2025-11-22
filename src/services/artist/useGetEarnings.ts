import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface Sale {
  artworkId: string;
  artworkTitle: string;
  artworkImage: string;
  salePrice: number;
  commission: number;
  earnings: number;
  soldAt: string;
  buyerEmail: string;
}

export interface EarningsData {
  totalSales: number;
  totalCommission: number;
  totalEarnings: number;
  totalWithdrawn: number;
  availableBalance: number;
  salesCount: number;
  sales: Sale[];
}

export interface EarningsResponse {
  success: boolean;
  data: EarningsData;
}

const fetchEarnings = async (): Promise<EarningsResponse> => {
  const response = await axios.get(
    `${import.meta.env.VITE_BETTER_AUTH_URL}/api/artist/earnings`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    }
  );
  return response.data;
};

export const useGetEarnings = () => {
  return useQuery({
    queryKey: ['artist-earnings'],
    queryFn: fetchEarnings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
