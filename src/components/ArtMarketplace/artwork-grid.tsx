import { useState } from "react"
import { ArtworkCard } from "@/components/artwork-card"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { useAuth } from "@/hooks/use-auth"
import { useCheckFavorite } from "@/queries/favoriteQueries"
import { CheckSquare, ChevronLeft, ChevronRight, Heart, Palette, Square } from "lucide-react"
import { useNavigate } from "react-router-dom"

// List view favorite button component
function ListFavoriteButton({
    artworkId,
    onFavorite
}: { artworkId: string; onFavorite: (id: string) => void }) {
    const { data: favoriteCheck } = useCheckFavorite(artworkId)
    const isFavorited = favoriteCheck?.isFavorite || false

    return (
        <button
            onClick={(e) => {
                e.stopPropagation()
                onFavorite(artworkId)
            }}
            className={`rounded-full p-2 transition-colors hover:bg-gray-100 ${isFavorited ? "text-red-500" : "text-gray-400"
                }`}
            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
            <Heart className={`h-5 w-5 ${isFavorited ? "fill-current" : ""}`} />
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
}

export function ArtworkGrid({
    artworks,
    viewMode,
    onFavorite,
    currentPage,
    totalPages,
    onPageChange,
    isSelectionMode = false,
    selectedArtworkIds = new Set(),
    onToggleSelection,
    hideFavorite = false
}: ArtworkGridProps) {
    const { isAuthenticated } = useAuth()
    const showFavorite = !hideFavorite && isAuthenticated
    const navigate = useNavigate()
    const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

    if (artworks.length === 0) {
        return (
            <section className="flex min-h-[500px] items-center px-4">
                <div className="mx-auto w-full max-w-7xl">
                    <EmptyState
                        icon={Palette}
                        title="No Artworks Found"
                        description="We couldn't find any artworks matching your search. Try adjusting your filters or browse our collections."
                        actionLabel="Browse Collections"
                        onAction={() => {
                            // Navigate to collections or clear filters
                            window.location.href = "/"
                        }}
                    />
                </div>
            </section>
        )
    }

    // Generate page numbers to display
    const getPageNumbers = () => {
        const safeTotalPages = totalPages ?? 1
        const safeCurrentPage = currentPage ?? 1
        if (!safeTotalPages || !safeCurrentPage) return []

        const pages: (number | string)[] = []
        const maxVisible = 5

        if (safeTotalPages <= maxVisible) {
            // Show all pages if total is small
            for (let i = 1; i <= safeTotalPages; i++) {
                pages.push(i)
            }
        } else {
            // Always show first page
            pages.push(1)

            if (safeCurrentPage > 3) {
                pages.push("...")
            }

            // Show pages around current page
            const start = Math.max(2, safeCurrentPage - 1)
            const end = Math.min(safeTotalPages - 1, safeCurrentPage + 1)

            for (let i = start; i <= end; i++) {
                pages.push(i)
            }

            if (safeCurrentPage < safeTotalPages - 2) {
                pages.push("...")
            }

            // Always show last page
            pages.push(safeTotalPages)
        }

        return pages
    }

    const pageNumbers = getPageNumbers()
    const safeTotalPages = totalPages ?? 1
    const safeCurrentPage = currentPage ?? 1

    return (
        <section className="px-4">
            <div className="mx-auto max-w-7xl">
                {viewMode === "list" ? (
                    <div className="space-y-4">
                        {artworks.map((artwork) => (
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
                                    {/* Status badge if available */}
                                    {artwork.status && (
                                        <div className="absolute bottom-1 left-1 rounded bg-white/90 px-1 py-0.5 text-[8px] font-bold tracking-wider text-gray-900 shadow-sm backdrop-blur-sm scale-[0.8] origin-bottom-left">
                                            {artwork.status}
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate font-semibold text-gray-900 text-sm sm:text-base uppercase tracking-wide">
                                            {artwork.artist}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-0.5 text-gray-500 text-xs sm:text-sm">
                                            <p className="truncate">
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
                                    <div className="flex flex-shrink-0 items-center justify-end gap-2 sm:gap-3">
                                        <p className="font-semibold text-gray-900 text-base sm:text-lg">
                                            {artwork.price}
                                        </p>
                                        {showFavorite && !isSelectionMode && (
                                            <div className="-mr-2">
                                                <ListFavoriteButton
                                                    artworkId={artwork.id}
                                                    onFavorite={onFavorite}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                        {artworks.map((artwork) => (
                            <div key={artwork.id} className="group relative">
                                {isSelectionMode && (
                                    <div className="absolute top-2 left-2 z-20">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onToggleSelection?.(artwork.id)
                                            }}
                                            className="rounded-md bg-white p-1.5 shadow-md transition-colors hover:bg-gray-50"
                                        >
                                            {selectedArtworkIds.has(artwork.id) ? (
                                                <CheckSquare className="h-5 w-5 text-blue-600" />
                                            ) : (
                                                <Square className="h-5 w-5 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                )}
                                <div
                                    className={
                                        isSelectionMode && selectedArtworkIds.has(artwork.id)
                                            ? "rounded-lg ring-2 ring-blue-500"
                                            : ""
                                    }
                                    onClick={(e) => {
                                        if (isSelectionMode) {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            onToggleSelection?.(artwork.id)
                                        }
                                    }}
                                    style={isSelectionMode ? { cursor: "pointer" } : {}}
                                >
                                    <ArtworkCard
                                        {...artwork}
                                        onFavorite={onFavorite}
                                        isMasonry={false}
                                        disableNavigation={isSelectionMode}
                                        hideFavorite={!showFavorite}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination - Show if we have page info and artworks */}
                {onPageChange && (
                    <div className="mt-12 flex flex-col items-center justify-center gap-4 pb-8">
                        {safeTotalPages > 1 ? (
                            <>
                                <div className="flex w-full flex-col items-center gap-6 sm:flex-row sm:justify-center">
                                    {/* Navigation Buttons - First row on mobile, split on desktop */}
                                    <div className="flex w-full items-center justify-between gap-4 sm:order-1 sm:w-auto">
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            disabled={safeCurrentPage === 1}
                                            onClick={() => onPageChange(safeCurrentPage - 1)}
                                            className="h-12 flex-1 items-center gap-2 border-gray-200 px-6 sm:h-10 sm:flex-none sm:border-2"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                            <span className="font-medium">Previous</span>
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="lg"
                                            disabled={safeCurrentPage >= safeTotalPages}
                                            onClick={() => onPageChange(safeCurrentPage + 1)}
                                            className="h-12 flex-1 items-center gap-2 border-gray-200 px-6 sm:h-10 sm:flex-none sm:border-2"
                                        >
                                            <span className="font-medium">Next</span>
                                            <ChevronRight className="h-5 w-5" />
                                        </Button>
                                    </div>

                                    {/* Page Numbers - Second row on mobile, middle on desktop */}
                                    <div className="flex flex-wrap items-center justify-center gap-2 sm:order-2">
                                        {pageNumbers.map((pageNum, index) => (
                                            <div key={index}>
                                                {pageNum === "..." ? (
                                                    <span className="px-2 text-gray-400">...</span>
                                                ) : (
                                                    <Button
                                                        variant={
                                                            safeCurrentPage === pageNum
                                                                ? "default"
                                                                : "outline"
                                                        }
                                                        size="sm"
                                                        onClick={() =>
                                                            onPageChange(pageNum as number)
                                                        }
                                                        className={`h-10 min-w-[40px] rounded-lg sm:h-9 ${safeCurrentPage === pageNum
                                                                ? "bg-gray-900 font-bold text-white hover:bg-black"
                                                                : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-2 text-center text-gray-500 text-xs sm:text-sm">
                                    Showing page <span className="font-semibold text-gray-900">{safeCurrentPage}</span> of <span className="font-semibold text-gray-900">{safeTotalPages}</span> (
                                    {artworks.length} artworks)
                                </div>
                            </>
                        ) : (
                            <div className="text-gray-600 text-sm">
                                Showing all {artworks.length} artworks
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    )
}
