import { SectionTitle } from "@/components/section-title"
import {
    ArtworkMasonryGrid,
    ArtworkMasonrySkeleton,
} from "@/components/ArtMarketplace/artwork-masonry-grid"
import { useSimilarArtworksByCategoryInfinite } from "@/queries/useSimilarArtworksByCategory"
import { useAddFavorite } from "@/services/favorites/useAddFavorite"
import type { Artwork } from "@/types/artwork.types"
import { useEffect, useMemo, useRef } from "react"

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

function mapArtworkToMasonryItem(artwork: Artwork) {
    const firstPhoto = artwork.photos?.[0]
    const imageUrl =
        firstPhoto && typeof firstPhoto === "string" && firstPhoto.trim() !== ""
            ? firstPhoto
            : ""

    return {
        id: artwork.id,
        image: imageUrl || "/placeholder.svg",
        title: artwork.title || "Untitled",
        artist: artwork.artist,
        price: formatPrice(artwork.desiredPrice),
        year: artwork.yearOfArtwork,
        medium: artwork.support,
        dimensions: formatDimensions(artwork.dimensions),
        physicalWidth: artwork.dimensions?.width,
        physicalHeight: artwork.dimensions?.height,
        seller: artwork.user?.name || artwork.artist,
        status: artwork.status,
    }
}

export function SimilarArtworks({ artworkId }: SimilarArtworksProps) {
    const loadMoreRef = useRef<HTMLDivElement>(null)
    const { addFavorite } = useAddFavorite()

    const {
        data: similarPages,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useSimilarArtworksByCategoryInfinite(artworkId)

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage()
                }
            },
            { threshold: 0.1 },
        )

        const target = loadMoreRef.current
        if (target) {
            observer.observe(target)
        }

        return () => observer.disconnect()
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    const artworks = useMemo(() => {
        const seen = new Set<string>()
        const rawArtworks =
            similarPages?.pages.flatMap((page) => page.artworks ?? []) ?? []

        return rawArtworks
            .filter((artwork) => {
                if (artwork.id === artworkId) return false
                if (seen.has(artwork.id)) return false
                seen.add(artwork.id)
                return true
            })
            .map(mapArtworkToMasonryItem)
    }, [similarPages, artworkId])

    const handleFavorite = async (id: string) => {
        try {
            await addFavorite(id)
        } catch (error) {
            console.error("Failed to toggle favorite:", error)
        }
    }

    if (isLoading) {
        return (
            <section className="py-16">
                <SectionTitle title="Similar Artworks" />
                <div className="mt-8">
                    <ArtworkMasonrySkeleton />
                </div>
            </section>
        )
    }

    if (artworks.length === 0) {
        return null
    }

    return (
        <section className="py-16">
            <SectionTitle title="Similar Artworks" />
            <div className="mt-8">
                <ArtworkMasonryGrid
                    artworks={artworks}
                    onFavorite={handleFavorite}
                    infiniteScroll={{
                        loadMoreRef,
                        isFetchingNextPage,
                        hasNextPage: !!hasNextPage,
                    }}
                />
            </div>
        </section>
    )
}
