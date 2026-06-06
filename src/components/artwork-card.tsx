import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import { useCheckFavorite } from "@/queries/favoriteQueries"
import { useAddFavorite } from "@/services/favorites/useAddFavorite"
import { useRemoveFavorite } from "@/services/favorites/useRemoveFavorite"
import { Heart } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

interface ArtworkCardProps {
    id: string
    image: string
    title: string
    artist: string
    price: string
    year?: string
    medium?: string
    dimensions: string
    physicalWidth?: string
    physicalHeight?: string
    seller: string
    status?: string
    onFavorite?: (id: string) => void
    isMasonry?: boolean
    onImageClick?: (src: string) => void
    artworks?: any[]
    disableNavigation?: boolean
    /** Hide favorite button in overlay (e.g. for guests on marketplace) */
    hideFavorite?: boolean
    /** Pre-calculated width/height ratio for masonry tile sizing */
    masonryAspectRatio?: number
}

const statusConfig = {
    APPROVED: {
        label: "Available",
        className: "bg-green-100 text-green-800 border-green-200"
    },
    SOLD: {
        label: "Sold",
        className: "bg-gray-100 text-gray-800 border-gray-200"
    }
}

export function ArtworkCard({
    id,
    image,
    title,
    artist,
    price,
    year,
    medium,
    dimensions,
    physicalWidth,
    physicalHeight,
    seller,
    status,
    onFavorite,
    isMasonry = false,
    disableNavigation = false,
    hideFavorite = false,
    masonryAspectRatio,
}: ArtworkCardProps) {
    const isSold = status === "SOLD"
    const statusInfo = status ? statusConfig[status as keyof typeof statusConfig] : null
    const [isHovered, setIsHovered] = useState(false)
    const [imageError, setImageError] = useState(false)
    const [imagePosition, setImagePosition] = useState({ x: 50, y: 50 })
    const navigate = useNavigate()

    // Check if artwork is favorited
    const { data: favoriteCheck } = useCheckFavorite(id)
    const serverIsFavorited = favoriteCheck?.isFavorite || false

    // Local state for optimistic updates - updates immediately before server response
    const [localIsFavorited, setLocalIsFavorited] = useState(serverIsFavorited)

    // Sync local state with server state when it changes
    useEffect(() => {
        setLocalIsFavorited(serverIsFavorited)
    }, [serverIsFavorited])

    // Use local state for immediate UI feedback, fallback to server state
    const isFavorited = localIsFavorited

    // Mutations with optimistic updates
    const { addFavorite } = useAddFavorite()
    const { removeFavorite } = useRemoveFavorite()

    // Check authentication status
    const { isAuthenticated } = useAuth()

    // Show favorite unless explicitly hidden (e.g. selection-only contexts)
    const showFavorite = !hideFavorite

    const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null)
    const [useNaturalImageHeight, setUseNaturalImageHeight] = useState(false)

    useEffect(() => {
        setImageAspectRatio(null)
        setUseNaturalImageHeight(false)
    }, [image])

    const isSquareThumbnail = (ratio: number) => ratio > 0.88 && ratio < 1.12

    // Thumbnails are often uniform squares — keep intentional tile ratios unless the photo is clearly not square
    const resolvedMasonryRatio = useNaturalImageHeight
        ? imageAspectRatio
        : masonryAspectRatio ?? imageAspectRatio

    const handleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation()

        if (!isAuthenticated) {
            navigate(`/login?redirect=${encodeURIComponent(`/artwork/${id}`)}`)
            return
        }

        // Optimistically update local state immediately for instant UI feedback
        const currentState = localIsFavorited
        const newFavoritedState = !currentState
        setLocalIsFavorited(newFavoritedState)

        try {
            if (currentState) {
                await removeFavorite(id)
            } else {
                await addFavorite(id)
            }
            onFavorite?.(id)
        } catch (error) {
            // Rollback optimistic update on error
            setLocalIsFavorited(currentState)
            console.error("Failed to toggle favorite:", error)
        }
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isMasonry) return
        const rect = e.currentTarget.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        setImagePosition({ x, y })
    }

    const handleMouseLeave = () => {
        setImagePosition({ x: 50, y: 50 })
        setIsHovered(false)
    }

    const handleMouseEnter = () => {
        if (isMasonry) return
        setIsHovered(true)
    }

    return (
        <div
            className="group relative cursor-pointer"
            onClick={() => !disableNavigation && navigate(`/artwork/${id}`)}
            onKeyDown={(e) => {
                if (!disableNavigation && (e.key === "Enter" || e.key === " ")) {
                    navigate(`/artwork/${id}`)
                }
            }}
        >
            <div
                className={cn(
                    "relative bg-gray-100",
                    !isMasonry && "mb-4 aspect-[4/5] overflow-hidden",
                    isMasonry && "mb-3 overflow-hidden rounded-xl",
                    isSold && "opacity-75",
                )}
                style={
                    isMasonry && resolvedMasonryRatio && !useNaturalImageHeight
                        ? { aspectRatio: resolvedMasonryRatio }
                        : undefined
                }
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
            >
                {imageError || !image ? (
                    <div
                        className={cn(
                            "flex h-full w-full items-center justify-center bg-gray-200",
                            isMasonry && !useNaturalImageHeight && "min-h-[160px]",
                            isMasonry && useNaturalImageHeight && "min-h-0",
                        )}
                    >
                        <div className="text-center">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            <p className="mt-2 text-gray-500 text-xs">No Image</p>
                        </div>
                    </div>
                ) : (
                    <img
                        src={image}
                        alt={`${title} by ${artist}`}
                        loading="lazy"
                        className={cn(
                            "block w-full",
                            isMasonry
                                ? useNaturalImageHeight
                                    ? "h-auto w-full"
                                    : resolvedMasonryRatio
                                      ? "h-full w-full object-cover"
                                      : "h-auto w-full"
                                : "h-full object-cover text-transparent transition-transform duration-300 ease-in-out transform-gpu",
                            isSold && "grayscale",
                        )}
                        style={
                            isMasonry
                                ? undefined
                                : {
                                      transformOrigin: `${imagePosition.x}% ${imagePosition.y}%`,
                                      transform: isHovered && !isSold ? "scale(1.2)" : "scale(1)",
                                  }
                        }
                        onLoad={(event) => {
                            if (!isMasonry) return
                            const img = event.currentTarget
                            if (img.naturalWidth <= 0 || img.naturalHeight <= 0) return

                            const naturalRatio = img.naturalWidth / img.naturalHeight
                            setImageAspectRatio(naturalRatio)

                            if (!isSquareThumbnail(naturalRatio)) {
                                setUseNaturalImageHeight(true)
                            }
                        }}
                        onError={() => setImageError(true)}
                    />
                )}
            </div>

            {/* Artwork Details */}
            <div className="space-y-1">
                <div className="flex min-w-0 items-center gap-2">
                    <h3
                        className="min-w-0 flex-1 truncate font-semibold text-black text-sm uppercase tracking-wide"
                        title={artist}
                    >
                        {artist}
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
                        {showFavorite && (
                            <button
                                type="button"
                                onClick={handleFavorite}
                                className={cn(
                                    "rounded-full p-1 text-gray-400 transition-colors hover:text-red-500",
                                    isFavorited && "text-red-500"
                                )}
                                aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                            >
                                <Heart className={cn("h-4 w-4", isFavorited && "fill-current")} />
                            </button>
                        )}
                    </div>
                </div>
                <p className="truncate text-gray-600 text-sm" title={title}>
                    <span className="text-orange-500">🏆</span> {title} {year && `(${year})`}
                </p>
                <p className="font-bold text-lg">{price}</p>
                {!isMasonry && (
                    <>
                        <p className="text-gray-600 text-sm">
                            {medium && `${medium} `}({dimensions})
                        </p>
                        <p className="text-gray-500 text-sm">Seller: {seller}</p>
                    </>
                )}
            </div>
        </div>
    )
}
