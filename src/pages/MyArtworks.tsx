import { useState } from "react";
import { useMyArtworks } from "@/queries/artworkQueries";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { EmptyState } from "@/components/ui/empty-state";
import { Palette, Plus, Edit, Trash2, Eye, ArrowLeft } from "lucide-react";
import { ArtworkCard } from "@/components/artwork-card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useDeleteArtwork } from "@/services/artwork/useDeleteArtwork";
import { useQueryClient } from "@tanstack/react-query";
import { artworkKeys } from "@/queries/queryKeys";
import { toast } from "sonner";

// Simple pagination component
const Pagination = ({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) => (
  <div className="flex items-center justify-center gap-2">
    <Button
      variant="outline"
      size="sm"
      disabled={currentPage === 1}
      onClick={() => onPageChange(currentPage - 1)}
      className="h-7 px-3 text-xs"
    >
      Previous
    </Button>
    <span className="text-xs text-gray-600">
      Page {currentPage} of {totalPages}
    </span>
    <Button
      variant="outline"
      size="sm"
      disabled={currentPage >= totalPages}
      onClick={() => onPageChange(currentPage + 1)}
      className="h-7 px-3 text-xs"
    >
      Next
    </Button>
  </div>
);

export default function MyArtworksPage() {
  const [page, setPage] = useState(1);
  const limit = 12;
  const navigate = useNavigate();
  const { data, isLoading, error } = useMyArtworks(page, limit);
  const { deleteArtwork, isDeleting } = useDeleteArtwork();
  const queryClient = useQueryClient();

  const artworks = data?.artworks || [];
  const pagination = data?.pagination || { page: 1, limit, total: 0, pages: 1 };

  const handleDelete = async (artworkId: string) => {
    if (window.confirm("Are you sure you want to delete this artwork?")) {
      try {
        await deleteArtwork(artworkId);
        queryClient.invalidateQueries({ queryKey: artworkKeys.myArtworks() });
        toast.success("Artwork deleted successfully");
      } catch (error: any) {
        toast.error("Failed to delete artwork: " + (error?.message || "An error occurred"));
      }
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-4 max-w-7xl">
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-3 border-gray-300 border-t-gray-600" />
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-4 max-w-7xl">
            <EmptyState
              icon={Palette}
              title="Error Loading Artworks"
              description="Failed to load your artworks. Please try again later."
            />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 py-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/profile")}
                  className="h-8 w-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-xl font-semibold text-gray-900">My Artworks</h1>
                <span className="text-sm text-gray-500">
                  ({pagination.total})
                </span>
              </div>
              <Button 
                onClick={() => navigate("/sellart")}
                className="bg-red-700 hover:bg-red-800 text-white rounded-full flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Artwork
              </Button>
            </div>
          </div>

          {/* Artworks Grid */}
          {artworks.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {artworks.map((artwork) => (
                  <div key={artwork.id} className="relative group">
                    <ArtworkCard
                      id={artwork.id}
                      image={artwork.photos?.[0] || "/placeholder.svg"}
                      title={artwork.title || "Untitled"}
                      artist={artwork.artist}
                      price={`$${artwork.desiredPrice?.toLocaleString() || "0"}`}
                      year={artwork.yearOfArtwork}
                      medium={artwork.technique}
                      dimensions={`${artwork.dimensions?.height || 0}x${artwork.dimensions?.width || 0} cm`}
                      seller={artwork.user?.name || "Unknown"}
                    />
                    <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-7 w-7 bg-white hover:bg-gray-100"
                        asChild
                      >
                        <Link to={`/artwork/${artwork.id}`}>
                          <Eye className="h-3.5 w-3.5 text-gray-700" />
                        </Link>
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-7 w-7 bg-white hover:bg-gray-100"
                        asChild
                      >
                        <Link to={`/artwork/${artwork.id}/edit`}>
                          <Edit className="h-3.5 w-3.5 text-gray-700" />
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleDelete(artwork.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.pages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={Palette}
              title="No Artworks Yet"
              description="You haven't uploaded any artworks yet. Start by adding your first piece!"
              actionLabel="Add New Artwork"
              onAction={() => window.location.href = "/sellart"}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

