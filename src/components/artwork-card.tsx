import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
    seller: string
    status?: string
    onFavorite?: (id: string) => void
    isMasonry?: boolean
    onImageClick?: (src: string) => void
    artworks?: any[]
    disableNavigation?: boolean
    /** Hide favorite button in overlay (e.g. for guests on marketplace) */
    hideFavorite?: boolean
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
    seller,
    status,
    onFavorite,
    isMasonry = false,
    disableNavigation = false,
    hideFavorite = false
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

    // Only show favorite button if not explicitly hidden AND user is authenticated
    const showFavorite = !hideFavorite && isAuthenticated

    const handleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation()

        // Safety check - should not be reachable if button is hidden for guests
        if (!isAuthenticated) return

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
            {/* Artwork Image Container */}
            <div
                className={cn(
                    "relative mb-4 overflow-hidden bg-gray-100",
                    !isMasonry && "aspect-[4/5]",
                    isSold && "opacity-75"
                )}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
            >
                {/* Status Badge */}
                {statusInfo && (
                    <div className="absolute top-2 left-2 z-20">
                        <Badge
                            variant="outline"
                            className={cn("border font-medium text-xs", statusInfo.className)}
                        >
                            {statusInfo.label}
                        </Badge>
                    </div>
                )}
                {imageError || !image ? (
                    <div className="flex h-full w-full items-center justify-center bg-gray-200">
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
                        className={cn(
                            "block h-full w-full object-cover text-transparent transition-transform duration-300 ease-in-out transform-gpu",
                            isSold && "grayscale"
                        )}
                        style={{
                            transformOrigin: `${imagePosition.x}% ${imagePosition.y}%`,
                            transform: isHovered && !isSold ? "scale(1.2)" : "scale(1)"
                        }}
                        onError={() => setImageError(true)}
                    />
                )}
                {/* Overlay background on hover (only when favorite button shown) */}
                {showFavorite && (
                    <div
                        className={`pointer-events-none absolute inset-0 cursor-pointer transition-all duration-500 ease-in-out ${isHovered ? "bg-black/60 opacity-100" : "bg-black/0 opacity-0"
                            }`}
                    />
                )}
                {/* Hover Buttons - slide down from top (hidden for guests) */}
                {showFavorite && (
                    <div
                        className={`absolute top-24 right-0 left-0 z-10 flex cursor-pointer justify-center gap-2 p-4 transition-all duration-500 ease-in-out ${isHovered
                            ? "pointer-events-auto translate-y-10 opacity-100"
                            : "-translate-y-full pointer-events-none opacity-0"
                            }`}
                    >
                        <Button
                            size="sm"
                            variant="secondary"
                            className={`bg-white/90 shadow-md hover:bg-white ${isFavorited ? "text-red-500" : ""}`}
                            onClick={handleFavorite}
                        >
                            <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
                        </Button>
                    </div>
                )}
            </div>

            {/* Artwork Details */}
            <div className="space-y-1">
                <h3 className="font-semibold text-black text-sm uppercase tracking-wide">
                    {artist}
                </h3>
                <p className="text-gray-600 text-sm">
                    <span className="text-orange-500">🏆</span> {title} {year && `(${year})`}
                </p>
                <p className="font-bold text-lg">{price}</p>
                <p className="text-gray-600 text-sm">
                    {medium && `${medium} `}({dimensions})
                </p>
                <p className="text-gray-500 text-sm">Seller: {seller}</p>
            </div>
        </div>
    )
}
