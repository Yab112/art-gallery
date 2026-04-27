import { ProtectedRoute } from "@/components/auth/protected-route"
import { FavoritesSkeleton } from "@/components/skeletons/favorites-skeleton"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { useFavorites } from "@/queries/favoriteQueries"
import { favoriteKeys } from "@/queries/queryKeys"
import { useRemoveFavorite } from "@/services/favorites/useRemoveFavorite"
import { useQueryClient } from "@tanstack/react-query"
import { ArrowRight, Heart, ShoppingBag, Trash2 } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

export default function FavoritesPage() {
    const [page, setPage] = useState(1)
    const limit = 12
    const { data, isLoading, error } = useFavorites(page, limit)
    const { removeFavorite } = useRemoveFavorite()
    const queryClient = useQueryClient()

    // Backend returns { success, favorites, pagination: { page, limit, total, pages } }
    const favorites = data?.favorites || []
    const pagination = data?.pagination || {
        page: data?.page || 1,
        limit: data?.limit || limit,
        total: data?.total || 0,
        pages: data?.pages || 1
    }

    const handleRemoveFavorite = async (artworkId: string) => {
        try {
            await removeFavorite(artworkId)
            // Invalidate favorites queries to refetch
            queryClient.invalidateQueries({ queryKey: favoriteKeys.all })
            toast.success("Removed from favorites")
        } catch (error: any) {
            toast.error(`Failed to remove favorite: ${error?.message || "An error occurred"}`)
        }
    }

    if (isLoading) {
        return (
            <ProtectedRoute>
                <FavoritesSkeleton />
            </ProtectedRoute>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <EmptyState
                    icon={Heart}
                    title="Error Loading Favorites"
                    description="Failed to load your favorites. Please try again later."
                />
            </div>
        )
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto max-w-6xl px-4 py-8">
                    {/* Header */}
                    <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm">
                        <div className="p-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
                                <div className="flex items-center space-x-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                        <Heart className="h-6 w-6 fill-current text-red-700" />
                                    </div>
                                    <div>
                                        <h1 className="font-bold text-3xl text-gray-900">
                                            My Favorites
                                        </h1>
                                        <p className="mt-1 text-gray-500">
                                            {pagination.total}{" "}
                                            {pagination.total === 1 ? "artwork" : "artworks"} saved
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    className="flex w-full items-center gap-2 sm:w-auto"
                                    asChild
                                >
                                    <Link to="/buyart">
                                        <ShoppingBag className="h-4 w-4" />
                                        Browse Artworks
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Favorites Grid */}
                    {favorites.length === 0 ? (
                        <div className="rounded-lg border border-gray-200 bg-white p-12 shadow-sm">
                            <EmptyState
                                icon={Heart}
                                title="No Favorites Yet"
                                description="Start exploring and save your favorite artworks to this list."
                                actionLabel="Browse Artworks"
                                onAction={() => (window.location.href = "/buyart")}
                            />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {favorites.map((favorite) => {
                                    const artwork = favorite.artwork
                                    if (!artwork) return null

                                    return (
                                        <div
                                            key={favorite.id}
                                            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                                        >
                                            {/* Artwork Image */}
                                            <Link to={`/artwork/${artwork.id}`}>
                                                <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                                                    <img
                                                        src={
                                                            artwork.photos?.[0] ||
                                                            "/placeholder.svg"
                                                        }
                                                        alt={artwork.title || artwork.artist}
                                                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                                                    />
                                                    <div className="absolute top-2 right-2">
                                                        <Button
                                                            size="icon"
                                                            variant="secondary"
                                                            className="h-8 w-8 bg-white/90 hover:bg-white"
                                                            onClick={(e) => {
                                                                e.preventDefault()
                                                                e.stopPropagation()
                                                                handleRemoveFavorite(artwork.id)
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Link>

                                            {/* Artwork Details */}
                                            <div className="p-4">
                                                <Link to={`/artwork/${artwork.id}`}>
                                                    <h3 className="mb-1 font-semibold text-gray-900 text-sm uppercase tracking-wide transition-colors hover:text-red-700">
                                                        {artwork.artist}
                                                    </h3>
                                                    <p className="mb-2 line-clamp-2 text-gray-600 text-sm">
                                                        {artwork.title || "Untitled"}
                                                        {artwork.yearOfArtwork &&
                                                            ` (${artwork.yearOfArtwork})`}
                                                    </p>
                                                    <p className="mb-2 font-bold text-gray-900 text-lg">
                                                        $
                                                        {artwork.desiredPrice?.toLocaleString() ||
                                                            "N/A"}
                                                    </p>
                                                    <div className="flex items-center justify-between text-gray-500 text-sm">
                                                        <span>{artwork.technique || "N/A"}</span>
                                                        {artwork.dimensions && (
                                                            <span>
                                                                {typeof artwork.dimensions ===
                                                                    "object"
                                                                    ? `${artwork.dimensions.height} × ${artwork.dimensions.width}`
                                                                    : artwork.dimensions}
                                                            </span>
                                                        )}
                                                    </div>
                                                </Link>
                                                <div className="mt-4 flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1"
                                                        asChild
                                                    >
                                                        <Link to={`/artwork/${artwork.id}`}>
                                                            View Details
                                                            <ArrowRight className="ml-2 h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Pagination */}
                            {pagination.pages > 1 && (
                                <div className="flex items-center justify-center gap-2 pt-6">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page === 1}
                                        onClick={() => setPage(page - 1)}
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-gray-600 text-sm">
                                        Page {pagination.page} of {pagination.pages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page >= pagination.pages}
                                        onClick={() => setPage(page + 1)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    )
}
