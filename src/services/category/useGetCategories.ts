import { useQuery } from "@tanstack/react-query";
import { api } from "@/hooks/use-axios-auth";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  artworkCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface CategoriesResponse {
  success?: boolean;
  categories?: Category[];
  // If backend returns array directly
}

export const useGetCategories = () => {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await api.get<CategoriesResponse | Category[]>("/categories");
      
      // Handle both response formats
      const data = response.data;
      if (Array.isArray(data)) {
        return data;
      }
      if (data && "categories" in data && Array.isArray(data.categories)) {
        return data.categories;
      }
      return [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

