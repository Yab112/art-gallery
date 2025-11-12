import { useFetchData } from "@/hooks/use-query";
import { collectionKeys } from "./queryKeys";
import type { Collection, CollectionListResponse } from "@/types/collection.types";

// Query Hooks
export const useCollections = (page: number = 1, limit: number = 10) => {
  return useFetchData<CollectionListResponse>(
    collectionKeys.list(page, limit),
    `collections?page=${page}&limit=${limit}`
  );
};

export const useMyCollections = (page: number = 1, limit: number = 10) => {
  return useFetchData<CollectionListResponse>(
    collectionKeys.list(page, limit),
    `collections/my-collections?page=${page}&limit=${limit}`
  );
};

export const useCollection = (id: string) => {
  return useFetchData<{ success: boolean; collection: Collection }>(
    collectionKeys.detail(id),
    `collections/${id}`,
    {
      enabled: !!id,
    }
  );
};
