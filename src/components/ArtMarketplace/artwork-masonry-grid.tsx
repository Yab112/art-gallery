import { type RefObject, useEffect, useMemo, useRef, useState } from "react"
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

const COLUMN_GUTTER = 20
const ITEM_GAP = 24
const FOOTER_HEIGHT = 92

/** width / height — lower = taller tile, higher = wider/shorter tile */
const MASONRY_FALLBACK_RATIOS = [
    0.52, 1.92, 0.58, 1.75, 0.64, 1.55, 0.7, 1.38, 0.76, 1.22, 0.82, 1.65,
]

function useMasonryColumnCount() {
    const [count, setCount] = useState(2)

    useEffect(() => {
        const update = () => {
            const width = window.innerWidth
            if (width >= 1280) setCount(4)
            else if (width >= 1024) setCount(3)
            else if (width >= 768) setCount(3)
            else setCount(2)
        }

        update()
        window.addEventListener("resize", update)
        return () => window.removeEventListener("resize", update)
    }, [])

    return count
}

function useMasonryColumnWidth(columnCount: number) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [columnWidth, setColumnWidth] = useState(260)

    useEffect(() => {
        const node = containerRef.current
        if (!node) return

        const measure = () => {
            const totalWidth = node.clientWidth
            const nextColumnWidth =
                (totalWidth - COLUMN_GUTTER * Math.max(columnCount - 1, 0)) / columnCount
            setColumnWidth(Math.max(nextColumnWidth, 140))
        }

        measure()
        const observer = new ResizeObserver(measure)
        observer.observe(node)
        return () => observer.disconnect()
    }, [columnCount])

    return { containerRef, columnWidth }
}

export function parsePhysicalAspectRatio(width?: string, height?: string): number | null {
    const w = Number.parseFloat(String(width || "").replace(/[^\d.]/g, ""))
    const h = Number.parseFloat(String(height || "").replace(/[^\d.]/g, ""))
    if (!w || !h) return null
    return w / h
}

function getMasonryAspectRatio(artwork: Artwork, index: number): number {
    const fallback = MASONRY_FALLBACK_RATIOS[index % MASONRY_FALLBACK_RATIOS.length]
    const physical = parsePhysicalAspectRatio(artwork.physicalWidth, artwork.physicalHeight)

    // Standard canvas sizes cluster around the same ratio — use intentional variety instead.
    // Only honor physical dims when they are clearly tall or wide.
    if (physical && (physical <= 0.72 || physical >= 1.35)) {
        return physical
    }

    return fallback
}

function estimateItemHeight(artwork: Artwork, index: number, columnWidth: number): number {
    const ratio = getMasonryAspectRatio(artwork, index)
    return columnWidth / ratio + FOOTER_HEIGHT + ITEM_GAP
}

function distributeToShortestColumn<T extends Artwork>(
    items: T[],
    columnCount: number,
    columnWidth: number,
): T[][] {
    const columns = Array.from({ length: columnCount }, () => ({
        items: [] as T[],
        height: 0,
    }))

    items.forEach((item, index) => {
        let shortestIndex = 0
        for (let i = 1; i < columns.length; i++) {
            if (columns[i].height < columns[shortestIndex].height) {
                shortestIndex = i
            }
        }

        columns[shortestIndex].items.push(item)
        columns[shortestIndex].height += estimateItemHeight(item, index, columnWidth)
    })

    return columns.map((column) => column.items)
}

function distributeHeightsToShortestColumn(
    items: { id: number; height: number }[],
    columnCount: number,
): { id: number; height: number }[][] {
    const columns = Array.from({ length: columnCount }, () => ({
        items: [] as { id: number; height: number }[],
        height: 0,
    }))

    items.forEach((item) => {
        let shortestIndex = 0
        for (let i = 1; i < columns.length; i++) {
            if (columns[i].height < columns[shortestIndex].height) {
                shortestIndex = i
            }
        }

        columns[shortestIndex].items.push(item)
        columns[shortestIndex].height += item.height + ITEM_GAP + FOOTER_HEIGHT
    })

    return columns.map((column) => column.items)
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
    const { containerRef, columnWidth } = useMasonryColumnWidth(columnCount)

    const columns = useMemo(
        () => distributeToShortestColumn(artworks, columnCount, columnWidth),
        [artworks, columnCount, columnWidth],
    )

    const aspectRatioById = useMemo(() => {
        const map = new Map<string, number>()
        artworks.forEach((artwork, index) => {
            map.set(artwork.id, getMasonryAspectRatio(artwork, index))
        })
        return map
    }, [artworks])

    return (
        <>
            <div ref={containerRef} className="w-full overflow-hidden">
                <div className="-ml-5 flex w-auto">
                    {columns.map((columnArtworks, columnIndex) => (
                        <div
                            key={`masonry-col-${columnIndex}`}
                            className="box-border w-full min-w-0 bg-clip-padding pl-5"
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
                                            masonryAspectRatio={aspectRatioById.get(artwork.id)}
                                            disableNavigation={isSelectionMode}
                                            hideFavorite={hideFavorite}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
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
    const { containerRef, columnWidth } = useMasonryColumnWidth(columnCount)
    const heights = [180, 420, 260, 520, 220, 380, 290, 480, 200, 360, 310, 440]
    const skeletonItems = heights.map((height, i) => ({ id: i, height }))

    const columns = useMemo(
        () => distributeHeightsToShortestColumn(skeletonItems, columnCount),
        [columnCount, columnWidth],
    )

    return (
        <div ref={containerRef} className="w-full overflow-hidden">
            <div className="-ml-5 flex w-auto">
                {columns.map((columnItems, columnIndex) => (
                    <div
                        key={`skeleton-col-${columnIndex}`}
                        className="box-border w-full min-w-0 bg-clip-padding pl-5"
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
        </div>
    )
}
