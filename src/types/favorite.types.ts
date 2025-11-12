// Favorite Types
export interface Favorite {
  id: string;
  userId: string;
  artworkId: string;
  createdAt: string;
  artwork?: any;
}

export interface FavoriteListResponse {
  success: boolean;
  favorites: Favorite[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  // Fallback for direct pagination fields
  page?: number;
  limit?: number;
  total?: number;
  pages?: number;
}

export interface FavoriteCheckResponse {
  isFavorite: boolean;
}

export interface FavoriteCountResponse {
  count: number;
}

