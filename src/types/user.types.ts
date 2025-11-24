// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  coverImage?: string;
  bio?: string;
  location?: string;
  website?: string;
  role: string;
  score: number;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  banned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  artworkCount?: number;
  reviewCount?: number;
  artworks?: any[];
  reviews?: any[];
}

