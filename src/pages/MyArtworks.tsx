import { useState } from "react";
import { useMyArtworks } from "@/queries/artworkQueries";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { EmptyState } from "@/components/ui/empty-state";
import { Palette, Plus, Edit, Trash2, Eye } from "lucide-react";
import { ArtworkCard } from "@/components/artwork-card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
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
    >
      Previous
    </Button>
    <span className="text-sm text-gray-600">
      Page {currentPage} of {totalPages}
    </span>
    <Button
      variant="outline"
      size="sm"
      disabled={currentPage >= totalPages}
      onClick={() => onPageChange(currentPage + 1)}
    >
      Next
    </Button>
  </div>
);

export default function MyArtworksPage() {
  const [page, setPage] = useState(1);
  const limit = 12;
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon={Palette}
          title="Error Loading Artworks"
          description="Failed to load your artworks. Please try again later."
        />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Palette className="h-6 w-6 text-red-700" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">My Artworks</h1>
                  <p className="text-gray-500 mt-1">
                    {pagination.total} {pagination.total === 1 ? "artwork" : "artworks"} total
                  </p>
                </div>
              </div>
              <Button className="bg-red-700 hover:bg-red-800 text-white" asChild>
                <Link to="/sellart">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Artwork
                </Link>
              </Button>
            </div>
          </div>

          {/* Artworks Grid */}
          {artworks.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 bg-white hover:bg-gray-100"
                        asChild
                      >
                        <Link to={`/artwork/${artwork.id}`}>
                          <Eye className="h-4 w-4 text-gray-700" />
                        </Link>
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 bg-white hover:bg-gray-100"
                        asChild
                      >
                        <Link to={`/artwork/${artwork.id}/edit`}>
                          <Edit className="h-4 w-4 text-gray-700" />
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDelete(artwork.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="mt-8 flex justify-center">
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

