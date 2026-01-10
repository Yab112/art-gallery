import { useQuery } from "@tanstack/react-query";
import { api } from "@/hooks/use-axios-auth";

export interface TalentType {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface TalentTypesResponse {
  success?: boolean;
  data?: TalentType[];
  // If backend returns array directly
}

export const useGetTalentTypes = () => {
  return useQuery<TalentType[]>({
    queryKey: ["talent-types"],
    queryFn: async () => {
      const response = await api.get<TalentTypesResponse | TalentType[]>("/talent-types");
      
      // Handle both response formats
      const data = response.data;
      if (Array.isArray(data)) {
        return data;
      }
      if (data && "data" in data && Array.isArray(data.data)) {
        return data.data;
      }
      if (data && "success" in data && data.success && Array.isArray((data as any).data)) {
        return (data as any).data;
      }
      return [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - longer cache since talent types don't change often
    gcTime: 60 * 60 * 1000, // 1 hour garbage collection time
  });
};












