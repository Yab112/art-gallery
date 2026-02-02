import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { collectionKeys } from "./queryKeys";
import type { Collection, CollectionListResponse } from "@/types/collection.types";
import type { ArtworkListResponse } from "@/types/artwork.types";
import useAxiosAuth from "@/hooks/use-axios-auth";

// Query Hooks
export const useCollections = (
  page: number = 1,
  limit: number = 10,
  visibility?: string, // Optional - defaults to "public" on backend if not provided
  search?: string,
  options?: Partial<UseQueryOptions<CollectionListResponse>>
) => {
  const axiosAuth = useAxiosAuth();

  // Only pass visibility if it's provided and not empty
  // For public collections page, don't pass visibility param - backend defaults to "public"
  const params: { page: number; limit: number; visibility?: string } = { page, limit };
  if (visibility && visibility !== "" && visibility !== "public") {
    // Only add visibility param if it's explicitly set and not "public" (since that's the default)
    params.visibility = visibility;
  }

  // Use "public" as the key when visibility is not provided (since that's the backend default)
  const effectiveVisibility = visibility || "public";

  // Build query string
  const queryParams = new URLSearchParams();
  if (params.page) {
    queryParams.append("page", params.page.toString());
  }
  if (params.limit) {
    queryParams.append("limit", params.limit.toString());
  }
  if (params.visibility && params.visibility !== "") {
    queryParams.append("visibility", params.visibility);
  }
  if (search) {
    queryParams.append("search", search);
  }
  const queryString = queryParams.toString();
  const url = `collections${queryString ? `?${queryString}` : ""}`;

  return useQuery<CollectionListResponse>({
    queryKey: [...collectionKeys.lists(), page, limit, effectiveVisibility, search],
    queryFn: async () => {
      const response = await axiosAuth.get<CollectionListResponse>(url);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export const useMyCollections = (page: number = 1, limit: number = 10) => {
  const axiosAuth = useAxiosAuth();

  return useQuery<CollectionListResponse>({
    queryKey: collectionKeys.list(page, limit),
    queryFn: async () => {
      const response = await axiosAuth.get<CollectionListResponse>(
        `collections/my-collections?page=${page}&limit=${limit}`
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCollection = (id: string) => {
  const axiosAuth = useAxiosAuth();

  return useQuery<{ success: boolean; collection: Collection }>({
    queryKey: collectionKeys.detail(id),
    queryFn: async () => {
      const response = await axiosAuth.get<{ success: boolean; collection: Collection }>(
        `collections/${id}`
      );
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get paginated artworks in a collection
 */
export const useCollectionArtworks = (
  collectionId: string,
  page: number = 1,
  limit: number = 12
) => {
  const axiosAuth = useAxiosAuth();

  return useQuery<ArtworkListResponse>({
    queryKey: [...collectionKeys.detail(collectionId), "artworks", page, limit],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());

      const response = await axiosAuth.get<{
        success: boolean;
        artworks: any[];
        count: number;
        page: number;
        limit: number;
        pages: number;
      }>(`collections/${collectionId}/artworks?${queryParams.toString()}`);

      // Transform the response to match ArtworkListResponse format
      return {
        success: true,
        artworks: response.data.artworks || [],
        total: response.data.count,
        page: response.data.page,
        limit: response.data.limit,
        pages: response.data.pages,
      };
    },
    enabled: !!collectionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get hot collections sorted by engagement score
 */
export const useHotCollections = (limit: number = 10) => {
  const axiosAuth = useAxiosAuth();

  return useQuery<{ success: boolean; collections: Collection[] }>({
    queryKey: [...collectionKeys.lists(), "hot", limit],
    queryFn: async () => {
      const response = await axiosAuth.get<{ success: boolean; collections: Collection[] }>(
        `collections/hot?limit=${limit}`
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes to keep hot collections fresh
  });
};
