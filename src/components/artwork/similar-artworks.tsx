import { SectionTitle } from "@/components/section-title"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { Skeleton } from "@/components/ui/skeleton"
import { useSimilarArtworksByCategory } from "@/queries/useSimilarArtworksByCategory"
import type { Artwork } from "@/types/artwork.types"
import { useState } from "react"
import { ArtworkCard } from "../artwork-card"

interface SimilarArtworksProps {
    artworkId: string
}

const formatPrice = (price: number): string => {
    return `€${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const formatDimensions = (dimensions: Artwork["dimensions"]): string => {
    if (!dimensions) return "N/A"
    if (typeof dimensions === "object" && "width" in dimensions && "height" in dimensions) {
        const { width, height, depth } = dimensions
        return depth ? `${width} × ${height} × ${depth} cm` : `${width} × ${height} cm`
    }
    return "N/A"
}

export function SimilarArtworks({ artworkId }: SimilarArtworksProps) {
    const [page, setPage] = useState(1)
    const limit = 8 // 2 rows × 4 columns = 8 items per page

    const { data: similarArtworks, isLoading } = useSimilarArtworksByCategory(
        artworkId,
        limit,
        page
    )

    // Calculate pagination
    const totalArtworks = similarArtworks?.length || 0
    const totalPages = Math.ceil(totalArtworks / limit)
    const hasMore = totalArtworks >= limit

    if (isLoading) {
        return (
            <section className="py-16">
                <SectionTitle title="Similar Artworks" />
                {/* Grid Layout Skeleton - 4 columns responsive, matches ArtworkCard structure */}
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="group relative space-y-3">
                            {/* Image Skeleton */}
                            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-gray-200">
                                <Skeleton className="h-full w-full" />
                            </div>

                            {/* Content Skeleton */}
                            <div className="space-y-2">
                                {/* Title */}
                                <Skeleton className="h-5 w-3/4" />

                                {/* Artist */}
                                <Skeleton className="h-4 w-1/2" />

                                {/* Price and Details */}
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-16" />
                                </div>

                                {/* Year and Medium */}
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-3 w-12" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        )
    }

    if (!similarArtworks || similarArtworks.length === 0) {
        return null
    }

    // Get artworks for current page
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedArtworks = similarArtworks.slice(startIndex, endIndex)

    return (
        <section className="py-16">
            <SectionTitle title="Similar Artworks" />

            {/* Grid Layout - 4 columns responsive, 2 rows */}
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {paginatedArtworks.map((artwork) => (
                    <ArtworkCard
                        key={artwork.id}
                        id={artwork.id}
                        image={artwork.photos?.[0] || "/placeholder.svg"}
                        title={artwork.title || "Untitled"}
                        artist={artwork.artist}
                        price={formatPrice(artwork.desiredPrice)}
                        year={artwork.yearOfArtwork}
                        medium={artwork.support}
                        dimensions={formatDimensions(artwork.dimensions)}
                        seller={artwork.user?.name || artwork.artist}
                    />
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <PaginationControls
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    totalItems={totalArtworks}
                    itemLabel="artworks"
                    itemLabelSingular="artwork"
                />
            )}
        </section>
    )
}
