import { api } from "@/hooks/use-axios-auth";
import type { Collection, CollectionListResponse } from "@/types/collection.types";

export interface GetCollectionsParams {
  page?: number;
  limit?: number;
  search?: string;
  visibility?: string;
}

/**
 * Get all collections with optional filters
 */
export const getCollections = async (
  params?: GetCollectionsParams
): Promise<CollectionListResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) {
    queryParams.append("page", params.page.toString());
  }
  
  if (params?.limit) {
    queryParams.append("limit", params.limit.toString());
  }
  
  if (params?.search) {
    queryParams.append("search", params.search);
  }
  
  // Handle visibility parameter
  // - If not provided (undefined) or empty string, backend defaults to "public" (secure default)
  // - Only add visibility param if a non-empty value is explicitly provided
  if (params?.visibility && params.visibility !== "") {
    queryParams.append("visibility", params.visibility);
  }
  
  const queryString = queryParams.toString();
  const url = `collections${queryString ? `?${queryString}` : ""}`;
  
  const response = await api.get<CollectionListResponse>(url);
  return response.data;
};

/**
 * Get user's own collections
 */
export const getMyCollections = async (
  page: number = 1,
  limit: number = 10
): Promise<CollectionListResponse> => {
  const response = await api.get<CollectionListResponse>(
    `collections/my-collections?page=${page}&limit=${limit}`
  );
  return response.data;
};

/**
 * Get a single collection by ID
 */
export const getCollection = async (
  id: string
): Promise<{ success: boolean; collection: Collection }> => {
  const response = await api.get<{ success: boolean; collection: Collection }>(
    `collections/${id}`
  );
  return response.data;
};

/**
 * Get paginated artworks in a collection
 */
export const getCollectionArtworks = async (
  collectionId: string,
  page: number = 1,
  limit: number = 12
): Promise<{ success: boolean; artworks: any[]; count: number; page: number; limit: number; pages: number }> => {
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("limit", limit.toString());
  
  const response = await api.get<{ 
    success: boolean; 
    artworks: any[]; 
    count: number;
    page: number;
    limit: number;
    pages: number;
  }>(`collections/${collectionId}/artworks?${queryParams.toString()}`);
  
  return response.data;
};

