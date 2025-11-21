import { useQuery } from "@tanstack/react-query";
import { collectionKeys } from "./queryKeys";
import type { Collection, CollectionListResponse } from "@/types/collection.types";
import type { ArtworkListResponse } from "@/types/artwork.types";
import { getCollections, getMyCollections, getCollection, getCollectionArtworks } from "@/lib/api/collections";

// Query Hooks
export const useCollections = (
  page: number = 1,
  limit: number = 10,
  visibility?: string // Optional - defaults to "public" on backend if not provided
) => {
  // Only pass visibility if it's provided and not empty
  const params: { page: number; limit: number; visibility?: string } = { page, limit };
  if (visibility && visibility !== "") {
    params.visibility = visibility;
  }
  
  return useQuery<CollectionListResponse>({
    queryKey: collectionKeys.list(page, limit),
    queryFn: () => getCollections(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useMyCollections = (page: number = 1, limit: number = 10) => {
  return useQuery<CollectionListResponse>({
    queryKey: collectionKeys.list(page, limit),
    queryFn: () => getMyCollections(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCollection = (id: string) => {
  return useQuery<{ success: boolean; collection: Collection }>({
    queryKey: collectionKeys.detail(id),
    queryFn: () => getCollection(id),
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
  return useQuery<ArtworkListResponse>({
    queryKey: [...collectionKeys.detail(collectionId), "artworks", page, limit],
    queryFn: async () => {
      const response = await getCollectionArtworks(collectionId, page, limit);
      // Transform the response to match ArtworkListResponse format
      return {
        success: true,
        artworks: response.artworks || [],
        total: response.count,
        page: response.page,
        limit: response.limit,
        pages: response.pages,
      };
    },
    enabled: !!collectionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
