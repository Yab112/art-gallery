import { Badge } from "@/components/ui/badge"
import { getAvatarUrl } from "@/utils/avatar"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

interface TalentType {
    id: string
    name: string
    slug: string
}

interface Artist {
    id: string
    name: string
    email?: string
    country: string
    followers: number
    artworks: number
    avatar: string
    tags?: string[]
    sales?: number
    views?: number
    rating?: number
    isTopSelling?: boolean
    isMostViewed?: boolean
    talentTypes?: TalentType[]
}

interface ArtistCardProps {
    artist: Artist
    showSales?: boolean
    showViews?: boolean
}

export function ArtistCard({ artist, showSales, showViews }: ArtistCardProps) {
    const [imageError, setImageError] = useState(false)
    const [placeholderError, setPlaceholderError] = useState(false)
    const navigate = useNavigate()

    // Debug: Log artist data
    if (process.env.NODE_ENV === "development") {
        console.log("ArtistCard - Artist data:", {
            id: artist.id,
            name: artist.name,
            email: artist.email,
            talentTypes: artist.talentTypes,
            views: artist.views,
            sales: artist.sales
        })
    }

    // Get avatar URL with fallback to placeholder service
    // If artist.avatar is empty/null, skip straight to placeholder
    const hasAvatar =
        artist.avatar &&
        artist.avatar.trim() !== "" &&
        artist.avatar !== "/placeholder.svg" &&
        artist.avatar !== "/default-avatar.png"
    const avatarUrl = hasAvatar ? getAvatarUrl(artist.avatar, artist.name, 200) : null
    const placeholderUrl = getAvatarUrl(null, artist.name, 200)

    const handleImageError = () => {
        if (!imageError) {
            setImageError(true)
        }
    }

    const handlePlaceholderError = () => {
        if (!placeholderError) {
            setPlaceholderError(true)
        }
    }

    const handleClick = () => {
        if (process.env.NODE_ENV === "development") {
            console.log("🎯 ArtistCard clicked - Navigating to artist page:", {
                artistId: artist.id,
                artistName: artist.name,
                artistEmail: artist.email,
                talentTypes: artist.talentTypes
            })
        }
        navigate(`/artist/${artist.id}`)
    }

    return (
        <div className="flex cursor-pointer flex-col items-center p-4" onClick={handleClick}>
            {/* Avatar - Clickable */}
            <div className="relative mb-3">
                {hasAvatar && !imageError ? (
                    <img
                        src={avatarUrl!}
                        alt={artist.name}
                        onError={handleImageError}
                        className="h-24 w-24 rounded-full border-4 border-gray-100 object-cover shadow-md sm:h-28 sm:w-28 md:h-32 md:w-32"
                    />
                ) : !placeholderError ? (
                    <img
                        src={placeholderUrl}
                        alt={artist.name}
                        onError={handlePlaceholderError}
                        className="h-24 w-24 rounded-full border-4 border-gray-100 object-cover shadow-md sm:h-28 sm:w-28 md:h-32 md:w-32"
                    />
                ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-gray-100 bg-blue-600 shadow-md sm:h-28 sm:w-28 md:h-32 md:w-32">
                        <span className="font-bold text-2xl text-white sm:text-3xl md:text-4xl">
                            {(artist.name || "A")[0].toUpperCase()}
                        </span>
                    </div>
                )}
                {artist.rating && (
                    <div className="-top-1 -right-1 absolute flex items-center gap-1 rounded-full bg-yellow-400 px-2 py-1 text-white text-xs shadow-md">
                        <span className="font-semibold text-xs">{artist.rating}</span>
                    </div>
                )}
            </div>

            {/* Name */}
            <div className="mb-2 w-full text-center">
                <h3 className="mb-1 line-clamp-1 font-bold text-base text-gray-900 sm:text-lg">
                    {artist.name}
                </h3>
            </div>

            {/* Email - Low opacity - Always show if available */}
            <div className="mb-2 min-h-[20px] w-full text-center">
                {artist.email ? (
                    <p className="line-clamp-1 text-gray-400 text-xs opacity-60 sm:text-sm">
                        {artist.email}
                    </p>
                ) : (
                    <p className="text-transparent text-xs sm:text-sm">-</p>
                )}
            </div>

            {/* Stats: Sales & Views */}
            <div className="mb-3 flex justify-center gap-4 text-gray-500 text-xs">
                {showViews && artist.views !== undefined && (
                    <div className="flex flex-col items-center">
                        <span className="font-bold text-gray-700">{artist.views}</span>
                        <span>Views</span>
                    </div>
                )}
                {showSales && artist.sales !== undefined && (
                    <div className="flex flex-col items-center">
                        <span className="font-bold text-gray-700">${artist.sales.toLocaleString()}</span>
                        <span>Sales</span>
                    </div>
                )}
            </div>

            {/* Talent Types - Low opacity - Always show space */}
            <div className="mb-2 min-h-[24px] w-full">
                {artist.talentTypes && artist.talentTypes.length > 0 ? (
                    <div className="flex flex-wrap justify-center gap-1.5">
                        {artist.talentTypes.slice(0, 2).map((talentType) => (
                            <Badge
                                key={talentType.id}
                                variant="secondary"
                                className="border-red-200 bg-red-50 px-2 py-0.5 text-red-700 text-xs opacity-60"
                            >
                                {talentType.name}
                            </Badge>
                        ))}
                        {artist.talentTypes.length > 2 && (
                            <Badge
                                variant="secondary"
                                className="bg-gray-100 px-2 py-0.5 text-gray-600 text-xs opacity-60"
                            >
                                +{artist.talentTypes.length - 2}
                            </Badge>
                        )}
                    </div>
                ) : (
                    <div className="h-6" />
                )}
            </div>
        </div>
    )
}
