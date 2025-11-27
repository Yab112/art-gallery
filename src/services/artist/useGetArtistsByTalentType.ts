import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/hooks/use-axios-auth";

export interface ArtistByTalentType {
  id: string;
  name: string;
  email?: string;
  avatar: string;
  artworks: number;
  sales: number;
  views: number;
  salesCount: number;
  country: string;
  profileViews: number;
  heatScore: number;
  lastActiveAt: string | null;
  talentTypes?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

interface GetArtistsByTalentTypeResponse {
  success: boolean;
  artists: ArtistByTalentType[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const useGetArtistsByTalentType = (
  talentTypeId: string,
  page: number = 1,
  limit: number = 20
) => {
  const axiosAuth = useAxiosAuth();

  return useQuery<GetArtistsByTalentTypeResponse>({
    queryKey: ["artists-by-talent-type", talentTypeId, page, limit],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        const url = `artist/by-talent-type/${talentTypeId}?${params.toString()}`;
        const response = await axiosAuth.get<{ success: boolean; data: GetArtistsByTalentTypeResponse }>(url);
        // Backend returns { success, data: { artists, pagination } }
        const responseData = response.data;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🎨 useGetArtistsByTalentType response:', {
            url,
            talentTypeId,
            responseData,
            artists: responseData.data?.artists?.length || 0,
          });
        }
        
        return {
          success: responseData.success,
          artists: responseData.data?.artists || [],
          pagination: responseData.data?.pagination || {
            page: 1,
            limit: 20,
            total: 0,
            pages: 0,
          },
        };
      } catch (error: any) {
        console.error("Error fetching artists by talent type:", error);
        throw error;
      }
    },
    enabled: !!talentTypeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

