// Artwork Types
export interface Artwork {
  id: string;
  title: string;
  artist: string;
  technique?: string;
  support: string;
  state: string;
  yearOfArtwork: string;
  dimensions: {
    height: number;
    width: number;
    depth?: number;
  };
  isFramed: boolean;
  weight: string;
  handDeliveryAccepted: boolean;
  origin: string;
  yearOfAcquisition: string;
  description: string;
  desiredPrice: number;
  acceptPriceNegotiation: boolean;
  accountHolder: string;
  iban: string;
  bicCode?: string;
  acceptTermsOfSale: boolean;
  giveSalesMandate: boolean;
  proofOfOrigin?: string;
  photos: string[];
  status: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  likeCount?: number;
  commentCount?: number;
  reviewCount?: number;
  isLiked?: boolean;
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
    image?: string;
  }>;
  interactions?: Array<{
    id: string;
    type: string;
    userId?: string;
    createdAt?: string;
  }>;
  comments?: Array<{
    id: string;
    authorName: string;
    content: string;
    createdAt: string;
  }>;
  reviews?: Array<{
    id: string;
    rating: number;
    comment?: string;
    user?: {
      id: string;
      name: string;
      email: string;
    };
    createdAt?: string;
  }>;
  isApproved?: boolean;
}

export interface ArtworkListResponse {
  success: boolean;
  artworks: Artwork[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ArtworkQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  artist?: string;
  categoryIds?: string[];
  support?: string;
  origin?: string;
  yearOfArtwork?: string;
  minPrice?: number;
  maxPrice?: number;
  isApproved?: boolean;
  sortBy?: "createdAt" | "desiredPrice" | "title" | "artist" | "updatedAt";
  orderBy?: "asc" | "desc";
}

export interface CreateArtworkDto {
  title?: string;
  artist: string;
  categoryIds: string[];
  support: string;
  state: string;
  yearOfArtwork: string;
  dimensions: {
    height: number;
    width: number;
    depth?: number;
  };
  isFramed: boolean;
  weight: string;
  handDeliveryAccepted: boolean;
  origin: string;
  yearOfAcquisition: string;
  description: string;
  desiredPrice: number;
  acceptPriceNegotiation: boolean;
  accountHolder: string;
  iban: string;
  bicCode?: string;
  acceptTermsOfSale: boolean;
  giveSalesMandate: boolean;
  proofOfOrigin?: string;
  photos: string[];
}

