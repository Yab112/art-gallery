import { useFavorites } from "@/queries/favoriteQueries";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Heart, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/ui/empty-state";
import { useRemoveFavorite } from "@/services/favorites/useRemoveFavorite";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { favoriteKeys } from "@/queries/queryKeys";
import { toast } from "sonner";
import { FavoritesSkeleton } from "@/components/skeletons/favorites-skeleton";

export default function FavoritesPage() {
  const [page, setPage] = useState(1);
  const limit = 12;
  const { data, isLoading, error } = useFavorites(page, limit);
  const { removeFavorite } = useRemoveFavorite();
  const queryClient = useQueryClient();

  // Backend returns { success, favorites, pagination: { page, limit, total, pages } }
  const favorites = data?.favorites || [];
  const pagination = data?.pagination || { page: data?.page || 1, limit: data?.limit || limit, total: data?.total || 0, pages: data?.pages || 1 };

  const handleRemoveFavorite = async (artworkId: string) => {
    try {
      await removeFavorite(artworkId);
      // Invalidate favorites queries to refetch
      queryClient.invalidateQueries({ queryKey: favoriteKeys.all });
      toast.success("Removed from favorites");
    } catch (error: any) {
      toast.error("Failed to remove favorite: " + (error?.message || "An error occurred"));
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <FavoritesSkeleton />
      </ProtectedRoute>
    );
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
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6 text-red-700 fill-current" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
                    <p className="text-gray-500 mt-1">
                      {pagination.total} {pagination.total === 1 ? "artwork" : "artworks"} saved
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="flex items-center gap-2" asChild>
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
              <EmptyState
                icon={Heart}
                title="No Favorites Yet"
                description="Start exploring and save your favorite artworks to this list."
                actionLabel="Browse Artworks"
                onAction={() => window.location.href = "/buyart"}
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((favorite) => {
                  const artwork = favorite.artwork;
                  if (!artwork) return null;

                  return (
                    <div
                      key={favorite.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {/* Artwork Image */}
                      <Link to={`/artwork/${artwork.id}`}>
                        <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                          <img
                            src={artwork.photos?.[0] || "/placeholder.svg"}
                            alt={artwork.title || artwork.artist}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 right-2">
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-8 w-8 bg-white/90 hover:bg-white"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRemoveFavorite(artwork.id);
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
                          <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide mb-1 hover:text-red-700 transition-colors">
                            {artwork.artist}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {artwork.title || "Untitled"}
                            {artwork.yearOfArtwork && ` (${artwork.yearOfArtwork})`}
                          </p>
                          <p className="font-bold text-lg text-gray-900 mb-2">
                            ${artwork.desiredPrice?.toLocaleString() || "N/A"}
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>{artwork.technique || "N/A"}</span>
                            {artwork.dimensions && (
                              <span>
                                {typeof artwork.dimensions === "object"
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
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
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
                  <span className="text-sm text-gray-600">
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
  );
}

