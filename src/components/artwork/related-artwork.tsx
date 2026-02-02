import { SectionTitle } from "@/components/section-title"
import { useRelatedArtworks } from "@/queries/useRelatedArtworks"
import type { Artwork } from "@/types/artwork.types"
import { Loader2 } from "lucide-react"
import { ArtworkCard } from "../artwork-card"

interface RelatedArtworksProps {
    artworkId: string
    artist?: string
    categoryIds?: Array<{ id: string; name?: string; slug?: string } | string>
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

export function RelatedArtworks({ artworkId, artist, categoryIds }: RelatedArtworksProps) {
    // Extract category IDs - handle both object and string formats
    const categoryIdStrings = categoryIds
        ?.map((c) => (typeof c === "string" ? c : c.id || c))
        .filter(Boolean) as string[] | undefined

    const { data: relatedArtworks, isLoading } = useRelatedArtworks(
        artworkId,
        artist,
        categoryIdStrings,
        8
    )

    if (isLoading) {
        return (
            <section className="py-16">
                <SectionTitle title="Related Artworks" />
                <div className="mt-12 flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-red-700" />
                </div>
            </section>
        )
    }

    if (!relatedArtworks || relatedArtworks.length === 0) {
        return null
    }

    return (
        <section className="py-16">
            <SectionTitle title={artist ? `Other works by ${artist}` : "Related Artworks"} />

            {/* Masonry Grid Layout */}
            <div className="mt-12 columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3 xl:columns-4">
                {relatedArtworks.map((artwork) => (
                    <div key={artwork.id} className="break-inside-avoid">
                        <ArtworkCard
                            isMasonry
                            id={artwork.id}
                            image={artwork.photos?.[0] || "/placeholder.svg"}
                            title={artwork.title || "Untitled"}
                            artist={artwork.artist}
                            price={formatPrice(artwork.desiredPrice)}
                            year={artwork.yearOfArtwork}
                            medium={artwork.support}
                            dimensions={formatDimensions(artwork.dimensions)}
                            seller={artwork.user?.name || artwork.artist}
                            status={artwork.status}
                        />
                    </div>
                ))}
            </div>
        </section>
    )
}
