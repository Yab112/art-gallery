import { type RefObject, useEffect, useMemo, useState } from "react"
import { ArtworkCard } from "@/components/artwork-card"
import { CheckSquare, Loader2, Square } from "lucide-react"

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

interface ArtworkMasonryGridProps {
    artworks: Artwork[]
    onFavorite: (id: string) => void
    isSelectionMode?: boolean
    selectedArtworkIds?: Set<string>
    onToggleSelection?: (id: string) => void
    hideFavorite?: boolean
    infiniteScroll?: {
        loadMoreRef: RefObject<HTMLDivElement>
        isFetchingNextPage: boolean
        hasNextPage: boolean
    }
}

function useMasonryColumnCount() {
    const [count, setCount] = useState(2)

    useEffect(() => {
        const update = () => {
            const width = window.innerWidth
            if (width >= 1280) setCount(5)
            else if (width >= 1024) setCount(4)
            else if (width >= 768) setCount(3)
            else setCount(2)
        }

        update()
        window.addEventListener("resize", update)
        return () => window.removeEventListener("resize", update)
    }, [])

    return count
}

function distributeIntoColumns<T>(items: T[], columnCount: number): T[][] {
    const columns: T[][] = Array.from({ length: columnCount }, () => [])
    items.forEach((item, index) => {
        columns[index % columnCount].push(item)
    })
    return columns
}

export function ArtworkMasonryGrid({
    artworks,
    onFavorite,
    isSelectionMode = false,
    selectedArtworkIds = new Set(),
    onToggleSelection,
    hideFavorite = false,
    infiniteScroll,
}: ArtworkMasonryGridProps) {
    const columnCount = useMasonryColumnCount()
    const columns = useMemo(
        () => distributeIntoColumns(artworks, columnCount),
        [artworks, columnCount],
    )

    return (
        <>
            <div className="-ml-5 flex w-auto">
                {columns.map((columnArtworks, columnIndex) => (
                    <div
                        key={`masonry-col-${columnIndex}`}
                        className="box-border w-full bg-clip-padding pl-5"
                        style={{ flex: 1 }}
                    >
                        {columnArtworks.map((artwork) => (
                            <div key={artwork.id} className="relative mb-6">
                                {isSelectionMode && (
                                    <button
                                        type="button"
                                        onClick={() => onToggleSelection?.(artwork.id)}
                                        className="absolute top-2 left-2 z-20 rounded-md bg-white p-1.5 shadow-md transition-colors hover:bg-gray-50"
                                    >
                                        {selectedArtworkIds.has(artwork.id) ? (
                                            <CheckSquare className="h-5 w-5 text-blue-600" />
                                        ) : (
                                            <Square className="h-5 w-5 text-gray-400" />
                                        )}
                                    </button>
                                )}

                                <div
                                    className={
                                        isSelectionMode && selectedArtworkIds.has(artwork.id)
                                            ? "rounded-xl ring-2 ring-blue-500"
                                            : undefined
                                    }
                                    onClick={(e) => {
                                        if (isSelectionMode) {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            onToggleSelection?.(artwork.id)
                                        }
                                    }}
                                >
                                    <ArtworkCard
                                        {...artwork}
                                        onFavorite={onFavorite}
                                        isMasonry
                                        disableNavigation={isSelectionMode}
                                        hideFavorite={hideFavorite}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {infiniteScroll ? (
                <div
                    ref={infiniteScroll.loadMoreRef}
                    className="mt-10 flex flex-col items-center justify-center py-8"
                >
                    {infiniteScroll.isFetchingNextPage ? (
                        <div className="flex items-center gap-3">
                            <Loader2 className="h-5 w-5 animate-spin text-red-700" />
                            <span className="font-medium text-gray-500 text-sm">
                                Loading more artworks...
                            </span>
                        </div>
                    ) : infiniteScroll.hasNextPage ? (
                        <span className="text-gray-400 text-xs uppercase tracking-widest">
                            Scroll for more
                        </span>
                    ) : (
                        <span className="text-gray-300 text-xs uppercase tracking-widest">
                            You&apos;ve seen it all
                        </span>
                    )}
                </div>
            ) : null}
        </>
    )
}

export function ArtworkMasonrySkeleton() {
    const columnCount = useMasonryColumnCount()
    const heights = [180, 420, 260, 380, 220, 340, 290, 450, 200, 360, 310, 240]
    const skeletonItems = heights.map((height, i) => ({ id: i, height }))

    const columns = useMemo(
        () => distributeIntoColumns(skeletonItems, columnCount),
        [columnCount],
    )

    return (
        <div className="-ml-5 flex w-auto">
            {columns.map((columnItems, columnIndex) => (
                <div
                    key={`skeleton-col-${columnIndex}`}
                    className="box-border w-full bg-clip-padding pl-5"
                    style={{ flex: 1 }}
                >
                    {columnItems.map((item) => (
                        <div key={item.id} className="mb-6 animate-pulse">
                            <div
                                className="rounded-xl bg-gray-100"
                                style={{ height: `${item.height}px` }}
                            />
                            <div className="mt-3 space-y-2">
                                <div className="h-4 w-4/5 rounded-full bg-gray-100" />
                                <div className="h-3 w-1/2 rounded-full bg-gray-50" />
                                <div className="h-4 w-1/3 rounded-full bg-gray-100" />
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}
