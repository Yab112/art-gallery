import type { ArtworkQueryParams } from "@/types/artwork.types";

// Query Keys Factory
export const userKeys = {
  all: ["user"] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  me: () => [...userKeys.all, "me"] as const,
};

export const artworkKeys = {
  all: ["artwork"] as const,
  lists: () => [...artworkKeys.all, "list"] as const,
  list: (params?: ArtworkQueryParams) =>
    [...artworkKeys.lists(), params] as const,
  details: () => [...artworkKeys.all, "detail"] as const,
  detail: (id: string) => [...artworkKeys.details(), id] as const,
  myArtworks: () => [...artworkKeys.all, "my-artworks"] as const,
  myArtworksList: (page?: number, limit?: number) =>
    [...artworkKeys.myArtworks(), page, limit] as const,
};

export const favoriteKeys = {
  all: ["favorite"] as const,
  lists: () => [...favoriteKeys.all, "list"] as const,
  list: (page?: number, limit?: number) =>
    [...favoriteKeys.lists(), page, limit] as const,
  check: (artworkId: string) =>
    [...favoriteKeys.all, "check", artworkId] as const,
  count: () => [...favoriteKeys.all, "count"] as const,
};

export const cartKeys = {
  all: ["cart"] as const,
  lists: () => [...cartKeys.all, "list"] as const,
  list: (page?: number, limit?: number) =>
    [...cartKeys.lists(), page, limit] as const,
  summary: () => [...cartKeys.all, "summary"] as const,
};

export const collectionKeys = {
  all: ["collection"] as const,
  lists: () => [...collectionKeys.all, "list"] as const,
  list: (page?: number, limit?: number) =>
    [...collectionKeys.lists(), page, limit] as const,
  details: () => [...collectionKeys.all, "detail"] as const,
  detail: (id: string) => [...collectionKeys.details(), id] as const,
};

export const uploadKeys = {
  all: ["upload"] as const,
  presigned: () => [...uploadKeys.all, "presigned"] as const,
};
