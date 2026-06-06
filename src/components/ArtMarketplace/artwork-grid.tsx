import { Badge } from "@/components/ui/badge"
import { type RefObject, useState } from "react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { useAuth } from "@/hooks/use-auth"
import { useCheckFavorite } from "@/queries/favoriteQueries"
import { CheckSquare, Heart, Palette, Square } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { ArtworkMasonryGrid } from "./artwork-masonry-grid"

const statusConfig = {
    APPROVED: {
        label: "Available",
        className: "bg-green-100 text-green-800 border-green-200"
    },
    SOLD: {
        label: "Sold",
        className: "bg-gray-100 text-gray-800 border-gray-200"
    }
} as const

// List view favorite button component
function ListFavoriteButton({
    artworkId,
    onFavorite
}: { artworkId: string; onFavorite: (id: string) => void }) {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()
    const { data: favoriteCheck } = useCheckFavorite(artworkId)
    const isFavorited = favoriteCheck?.isFavorite || false

    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation()
                if (!isAuthenticated) {
                    navigate(`/login?redirect=${encodeURIComponent(`/artwork/${artworkId}`)}`)
                    return
                }
                onFavorite(artworkId)
            }}
            className={`rounded-full p-1 transition-colors hover:text-red-500 ${isFavorited ? "text-red-500" : "text-gray-400"
                }`}
            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
            <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
        </button>
    )
}

interface Artwork {
    id: string
    image: string
    title: string
    artist: string
    price: string
    year: string
    medium?: string
    dimensions: string
    physicalWidth?: string
    physicalHeight?: string
    seller: string
    status?: string
}

interface ArtworkGridProps {
    artworks: Artwork[]
    viewMode: "grid" | "list"
    onFavorite: (id: string) => void
    currentPage?: number
    totalPages?: number
    onPageChange?: (page: number) => void
    isSelectionMode?: boolean
    selectedArtworkIds?: Set<string>
    onToggleSelection?: (id: string) => void
    /** Hide favorite button in card overlay (e.g. for guests) */
    hideFavorite?: boolean
    /** Enable infinite scroll instead of pagination (grid masonry mode) */
    infiniteScroll?: {
        loadMoreRef: RefObject<HTMLDivElement>
        isFetchingNextPage: boolean
        hasNextPage: boolean
    }
}

export function ArtworkGrid({
    artworks,
    viewMode,
    onFavorite,
    isSelectionMode = false,
    selectedArtworkIds = new Set(),
    onToggleSelection,
    hideFavorite = false,
    infiniteScroll,
}: ArtworkGridProps) {
    const showFavorite = !hideFavorite
    const navigate = useNavigate()
    const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

    if (artworks.length === 0) {
        return (
            <div className="flex min-h-[500px] items-center">
                <EmptyState
                    icon={Palette}
                    title="No Artworks Found"
                    description="We couldn't find any artworks matching your search. Try adjusting your filters or browse our collections."
                    actionLabel="Browse Collections"
                    onAction={() => {
                        window.location.href = "/"
                    }}
                />
            </div>
        )
    }

    return (
        <>
            {viewMode === "list" ? (
                <div className="space-y-4">
                        {artworks.map((artwork) => {
                            const statusInfo = artwork.status
                                ? statusConfig[artwork.status as keyof typeof statusConfig]
                                : null

                            return (
                            <div
                                key={artwork.id}
                                className={`group relative flex items-center gap-3 sm:gap-4 border-b border-gray-100 bg-white py-3 px-2 sm:px-4 transition-colors hover:bg-gray-50 ${isSelectionMode && selectedArtworkIds.has(artwork.id)
                                    ? "bg-blue-50/50"
                                    : ""
                                    } ${!isSelectionMode ? "cursor-pointer" : ""}`}
                                onClick={(e) => {
                                    if (isSelectionMode) {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        onToggleSelection?.(artwork.id)
                                    } else {
                                        navigate(`/artwork/${artwork.id}`)
                                    }
                                }}
                            >
                                {isSelectionMode && (
                                    <div className="flex-shrink-0">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onToggleSelection?.(artwork.id)
                                            }}
                                            className="rounded-md p-1 transition-colors hover:bg-gray-100"
                                        >
                                            {selectedArtworkIds.has(artwork.id) ? (
                                                <CheckSquare className="h-5 w-5 text-blue-600" />
                                            ) : (
                                                <Square className="h-5 w-5 text-gray-300" />
                                            )}
                                        </button>
                                    </div>
                                )}

                                {/* Image */}
                                <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                                    {artwork.image && !imageErrors.has(artwork.id) ? (
                                        <img
                                            src={artwork.image}
                                            alt={`${artwork.title} by ${artwork.artist}`}
                                            className="block h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            onError={() => {
                                                setImageErrors((prev) => {
                                                    const next = new Set(prev)
                                                    next.add(artwork.id)
                                                    return next
                                                })
                                            }}
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-gray-200">
                                            <div className="text-center">
                                                <svg className="mx-auto h-5 w-5 sm:h-6 sm:w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <h3
                                                className="min-w-0 flex-1 truncate font-semibold text-gray-900 text-sm uppercase tracking-wide sm:text-base"
                                                title={artwork.artist}
                                            >
                                                {artwork.artist}
                                            </h3>
                                            <div className="flex shrink-0 items-center gap-1.5">
                                                {statusInfo && (
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            "border px-1.5 py-0 font-medium text-[10px]",
                                                            statusInfo.className
                                                        )}
                                                    >
                                                        {statusInfo.label}
                                                    </Badge>
                                                )}
                                                {showFavorite && !isSelectionMode && (
                                                    <ListFavoriteButton
                                                        artworkId={artwork.id}
                                                        onFavorite={onFavorite}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-0.5 flex items-center gap-2 text-gray-500 text-xs sm:text-sm">
                                            <p className="truncate" title={artwork.title}>
                                                {artwork.title}
                                                {artwork.year && ` (${artwork.year})`}
                                            </p>
                                            {artwork.medium && (
                                                <>
                                                    <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-gray-300 flex-shrink-0" />
                                                    <span className="hidden sm:inline-block truncate">{artwork.medium}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-shrink-0 items-center justify-end">
                                        <p className="font-semibold text-gray-900 text-base sm:text-lg">
                                            {artwork.price}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            )
                        })}
                    </div>
                ) : (
                    <ArtworkMasonryGrid
                        artworks={artworks}
                        onFavorite={onFavorite}
                        isSelectionMode={isSelectionMode}
                        selectedArtworkIds={selectedArtworkIds}
                        onToggleSelection={onToggleSelection}
                        hideFavorite={hideFavorite}
                        infiniteScroll={infiniteScroll}
                    />
                )}
        </>
    )
}
