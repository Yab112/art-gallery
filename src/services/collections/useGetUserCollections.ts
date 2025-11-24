import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/hooks/use-axios-auth";
import type { CollectionListResponse } from "@/types/collection.types";

export const useGetUserCollections = (
  userId: string,
  page: number = 1,
  limit: number = 12,
  visibility: string = "public"
) => {
  const axiosAuth = useAxiosAuth();

  return useQuery<CollectionListResponse>({
    queryKey: ["user-collections", userId, page, limit, visibility],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "100", // Get more to filter by userId
          visibility,
        });
        const url = `collections?${params.toString()}`;
        const response = await axiosAuth.get<CollectionListResponse>(url);
        
        // Filter by userId client-side
        const userCollections = response.data.collections.filter(
          (c) => c.createdBy === userId
        );
        
        // Calculate pagination
        const total = userCollections.length;
        const pages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedCollections = userCollections.slice(startIndex, endIndex);
        
        return {
          ...response.data,
          collections: paginatedCollections,
          total,
          pages,
          page,
          limit,
        };
      } catch (error: any) {
        console.error("Error fetching user collections:", error);
        throw error;
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

