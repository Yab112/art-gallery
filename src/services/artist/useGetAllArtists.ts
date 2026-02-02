import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import useAxiosAuth from "@/hooks/use-axios-auth";

export interface TalentType {
  id: string;
  name: string;
  slug: string;
}

export interface Artist {
  id: string;
  name: string;
  email?: string;
  avatar: string;
  artworks: number;
  sales: number;
  views: number;
  salesCount: number;
  country: string;
  talentTypes?: TalentType[];
}

interface GetAllArtistsResponse {
  success: boolean;
  artists: Artist[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const useGetAllArtists = (
  page: number = 1,
  limit: number = 50,
  search?: string,
  country?: string,
  talentTypeId?: string,
  email?: string,
  options?: Partial<UseQueryOptions<GetAllArtistsResponse>>
) => {
  const axiosAuth = useAxiosAuth();

  return useQuery<GetAllArtistsResponse>({
    queryKey: ["all-artists", page, limit, search, country, talentTypeId, email],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (search) {
          params.append("search", search);
        }
        if (country) {
          params.append("country", country);
        }
        if (talentTypeId) {
          params.append("talentTypeId", talentTypeId);
        }
        if (email) {
          params.append("email", email);
        }
        const url = `artist/all?${params.toString()}`;
        const response = await axiosAuth.get<GetAllArtistsResponse>(url);
        return response.data;
      } catch (error: any) {
        console.error("Error fetching all artists:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    // Keep previous data visible while fetching new data (prevents flicker)
    placeholderData: (previousData) => previousData,
    // Only show loading state on initial fetch, not on refetches
    refetchOnWindowFocus: false,
    ...options,
  });
};

