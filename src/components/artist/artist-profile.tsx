import { FollowButton } from "@/components/follow/follow-button"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import type { UserProfile } from "@/types/user.types"
import { getAvatarUrl } from "@/utils/avatar"
import { Bell, Globe, Heart, MapPin, Palette, Share2 } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"

interface ArtistProfileProps {
    user: UserProfile
}

export function ArtistProfile({ user }: ArtistProfileProps) {
    const { user: currentUser } = useAuth()
    const isGuest = !currentUser
    const [isLiked, setIsLiked] = useState(false)
    const [imageError, setImageError] = useState(false)
    const [coverImageError, setCoverImageError] = useState(false)

    const isOwnProfile = currentUser?.id === user.id

    const avatarUrl = getAvatarUrl(user.image, user.name || "Artist", 200)
    const displayUrl = imageError ? getAvatarUrl(null, user.name || "Artist", 200) : avatarUrl
    const coverImageUrl = user.coverImage || "/default-cover.jpg"

    return (
        <div className="mb-12">
            {/* Cover Image Card */}
            <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                {/* Cover Image */}
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                    {!coverImageError && coverImageUrl && coverImageUrl !== "/default-cover.jpg" ? (
                        <img
                            src={coverImageUrl}
                            alt={`${user.name || "Artist"} cover`}
                            className="h-full w-full object-cover"
                            onError={() => setCoverImageError(true)}
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <Palette className="h-12 w-12 text-gray-400" />
                        </div>
                    )}
                </div>

                {/* Header with Profile Picture and Info */}
                <div className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="-mt-16 flex items-center space-x-4">
                            {/* Profile Picture */}
                            <div className="relative">
                                <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-white shadow-md">
                                    <img
                                        src={displayUrl}
                                        alt={user.name || "Artist profile"}
                                        className="h-full w-full object-cover"
                                        onError={() => setImageError(true)}
                                        onLoad={() => setImageError(false)}
                                    />
                                </div>
                            </div>

                            {/* Name and Details */}
                            <div className="mt-12">
                                <h1 className="font-bold text-3xl text-gray-900">
                                    {user.name || "Artist"}
                                </h1>
                                <div className="mt-2 flex flex-wrap items-center gap-3 text-gray-600 text-sm">
                                    {user.location && (
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="h-4 w-4" />
                                            <span>{user.location}</span>
                                        </div>
                                    )}
                                    {user.website && (
                                        <a
                                            href={user.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 transition-colors hover:text-red-700"
                                        >
                                            <Globe className="h-4 w-4" />
                                            <span className="underline">Website</span>
                                        </a>
                                    )}
                                    {user.artworkCount !== undefined && (
                                        <div className="flex items-center gap-1.5">
                                            <Palette className="h-4 w-4" />
                                            <span>
                                                {user.artworkCount}{" "}
                                                {user.artworkCount === 1 ? "artwork" : "artworks"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-4 flex flex-wrap gap-2 lg:mt-0">
                            {!isOwnProfile &&
                                (isGuest ? (
                                    <Link
                                        to={`/login?redirect=${encodeURIComponent(`/artist/${user.id}`)}`}
                                    >
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-full"
                                        >
                                            Sign in to follow
                                        </Button>
                                    </Link>
                                ) : (
                                    <FollowButton
                                        userId={user.id}
                                        isFollowing={user.isFollowing}
                                        variant="default"
                                        className="bg-red-700 text-white shadow-sm hover:bg-red-800"
                                    />
                                ))}
                            <Button
                                variant="outline"
                                size="icon"
                                className="border-gray-300 hover:bg-gray-50"
                                title="Notifications"
                            >
                                <Bell className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="border-gray-300 hover:bg-gray-50"
                                onClick={() => setIsLiked(!isLiked)}
                                title="Like"
                            >
                                <Heart
                                    className={`h-4 w-4 ${
                                        isLiked ? "fill-current text-red-500" : ""
                                    }`}
                                />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="border-gray-300 hover:bg-gray-50"
                                title="Share"
                            >
                                <Share2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Bio/Introduction */}
                    {user.bio && (
                        <div className="mt-6 border-gray-200 border-t pt-6">
                            <p className="text-base text-gray-700 leading-relaxed">{user.bio}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
