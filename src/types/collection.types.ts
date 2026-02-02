// Collection Types
export interface Collection {
    id: string
    name: string
    description?: string
    coverImage?: string
    visibility: string
    createdAt: string
    createdBy: string
    user?: any
    artworks?: any[]
    artworkCount?: number
    // Engagement metrics (from backend)
    totalViews?: number
    totalLikes?: number
    totalComments?: number
    totalFavorites?: number
    engagementScore?: number
}

export interface CollectionListResponse {
    success: boolean
    collections: Collection[]
    page: number
    limit: number
    total: number
    pages: number
}

export interface CreateCollectionDto {
    name: string
    description?: string
    coverImage?: string
    visibility?: string
}
