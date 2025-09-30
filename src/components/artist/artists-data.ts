export interface Artist {
  id: string;
  name: string;
  country: string;
  followers: number;
  artworks: number;
  avatar: string;
  tags?: string[];
  sales?: number;
  views?: number;
  rating?: number;
  isTopSelling?: boolean;
  isMostViewed?: boolean;
}

export const artists: Artist[] = [
  {
    id: "1",
    name: "0XEC6D0",
    country: "France",
    followers: 32,
    artworks: 1,
    avatar: "/artist-1.webp",
    tags: ["Digital Art", "Minimalist", "Contemporary"],
    sales: 15000,
    views: 2500,
    rating: 4.8,
    isTopSelling: false,
    isMostViewed: true,
  },
  {
    id: "2",
    name: "1/G",
    country: "France",
    followers: 8,
    artworks: 3,
    avatar: "/artwork-1.jpg",
    tags: ["Abstract", "Sculpture", "Modern"],
    sales: 45000,
    views: 8900,
    rating: 4.9,
    isTopSelling: true,
    isMostViewed: false,
  },
  {
    id: "3",
    name: "121185129514",
    country: "France",
    followers: 16,
    artworks: 6,
    avatar: "/artwork-2.jpg",
    tags: ["Photography", "Portrait", "Black & White"],
    sales: 28000,
    views: 12000,
    rating: 4.7,
    isTopSelling: true,
    isMostViewed: true,
  },
  {
    id: "4",
    name: "2FAST",
    country: "Croatia",
    followers: 143,
    artworks: 37,
    avatar: "/artwork-3.jpg",
    tags: ["Explosive Art", "Colorful", "Dynamic"],
    sales: 67000,
    views: 15000,
    rating: 4.9,
    isTopSelling: true,
    isMostViewed: false,
  },
  {
    id: "5",
    name: "2MÉ",
    country: "France",
    followers: 74,
    artworks: 26,
    avatar: "/artwork-4.jpg",
    tags: ["Geometric", "Wood Art", "Pattern"],
    sales: 32000,
    views: 6800,
    rating: 4.6,
    isTopSelling: false,
    isMostViewed: false,
  },
  {
    id: "6",
    name: "ArtMaster",
    country: "Italy",
    followers: 256,
    artworks: 89,
    avatar: "/artwork-5.jpg",
    tags: ["Renaissance", "Classical", "Oil Painting"],
    sales: 125000,
    views: 25000,
    rating: 5.0,
    isTopSelling: true,
    isMostViewed: true,
  },
  {
    id: "7",
    name: "PixelVision",
    country: "Japan",
    followers: 189,
    artworks: 45,
    avatar: "/artwork-6.jpg",
    tags: ["Pixel Art", "Gaming", "Retro"],
    sales: 89000,
    views: 18500,
    rating: 4.8,
    isTopSelling: true,
    isMostViewed: false,
  },
];
