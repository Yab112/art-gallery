export interface Category {
  id: string
  name: string
  image: string
  count?: string
}

export interface Artwork {
  id: string
  image: string
  title: string
  artist: string
  price: string
  year?: string
  medium: string
  dimensions: string
  seller: string
}

export interface FilterOption {
  id: string
  label: string
  count?: number
}

export type ViewMode = "grid" | "list"
export type SortOption = "recommended" | "price-low" | "price-high" | "newest" | "oldest"
