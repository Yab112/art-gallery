import { useParams, useNavigate } from "react-router-dom";
import { useCollection } from "@/queries/collectionQueries";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { EmptyState } from "@/components/ui/empty-state";
import {
  FolderOpen,
  ArrowLeft,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
} from "lucide-react";
import { ArtworkCard } from "@/components/artwork-card";
import { Button } from "@/components/ui/button";
import { useRemoveArtworkFromCollection } from "@/services/collections/useRemoveArtworkFromCollection";
import { usePublishCollection } from "@/services/collections/usePublishCollection";
import { useUnpublishCollection } from "@/services/collections/useUnpublishCollection";
import { useDeleteCollection } from "@/services/collections/useDeleteCollection";
import { useQueryClient } from "@tanstack/react-query";
import { collectionKeys } from "@/queries/queryKeys";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, isLoading, error } = useCollection(id || "");
  const { removeArtwork: removeArtworkFromCollection } =
    useRemoveArtworkFromCollection();
  const { publishCollection } = usePublishCollection();
  const { unpublishCollection } = useUnpublishCollection();
  const { deleteCollection } = useDeleteCollection();
  const queryClient = useQueryClient();

  const collection = data?.collection;
  const isOwner = collection?.createdBy === user?.id;

  const handleRemoveArtwork = async (artworkId: string) => {
    if (!id) return;
    if (
      window.confirm(
        "Are you sure you want to remove this artwork from the collection?"
      )
    ) {
      try {
        await removeArtworkFromCollection(id, artworkId);
        queryClient.invalidateQueries({ queryKey: collectionKeys.detail(id) });
        toast.success("Artwork removed from collection");
      } catch (error: any) {
        toast.error(
          "Failed to remove artwork: " + (error?.message || "An error occurred")
        );
      }
    }
  };

  const handlePublishToggle = async () => {
    if (!id || !collection) return;
    try {
      if (collection.visibility === "public") {
        await unpublishCollection(id);
        // Success toast handled by hook
      } else {
        // Check if collection has at least 3 artworks (backend requirement)
        const artworks = Array.isArray(collection?.artworks)
          ? collection.artworks
          : [];
        const artworkCount = artworks.length;
        if (artworkCount < 3) {
          toast.error(
            `Collection must have at least 3 artworks to be published. Currently has ${artworkCount}.`
          );
          return;
        }
        await publishCollection(id);
        // Success toast handled by hook
      }
      queryClient.invalidateQueries({ queryKey: collectionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
    } catch (error: any) {
      // Error toast handled by hook, but show additional error if needed
      const errorMessage = error?.response?.data?.message || error?.message;
      if (
        errorMessage &&
        !errorMessage.includes("Collection must have at least")
      ) {
        toast.error("Failed to update collection: " + errorMessage);
      }
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (
      window.confirm(
        "Are you sure you want to delete this collection? This action cannot be undone."
      )
    ) {
      try {
        await deleteCollection(id);
        queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
        toast.success("Collection deleted successfully");
        navigate("/profile");
      } catch (error: any) {
        toast.error(
          "Failed to delete collection: " +
            (error?.message || "An error occurred")
        );
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

  if (error || !collection) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon={FolderOpen}
          title="Collection Not Found"
          description="This collection doesn't exist or you don't have access to it."
          actionLabel="Back to Profile"
          onAction={() => navigate("/profile")}
        />
      </div>
    );
  }

  // Handle artworks - backend returns artworks array directly
  // The backend maps collection.artworks.map((ca) => ca.artwork) so artworks is an array of artwork objects
  const artworks = Array.isArray(collection?.artworks)
    ? collection.artworks
    : [];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            {/* Cover Image Section */}
            <div className="w-full h-64 bg-gray-100 relative overflow-hidden">
              {collection.coverImage ? (
                <img
                  src={collection.coverImage}
                  alt={collection.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <FolderOpen className="h-24 w-24 text-gray-400" />
                </div>
              )}
              {/* Visibility Badge Overlay */}
              <div className="absolute top-4 right-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                    collection.visibility === "public"
                      ? "bg-green-500/90 text-white"
                      : collection.visibility === "unlisted"
                      ? "bg-yellow-500/90 text-white"
                      : "bg-gray-500/90 text-white"
                  }`}
                >
                  {collection.visibility}
                </span>
              </div>
              {/* Back Button Overlay */}
              <div className="absolute top-4 left-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/profile")}
                  className="bg-white/90 hover:bg-white backdrop-blur-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Collection Info Section */}
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {collection.name}
                  </h1>
                  {collection.description && (
                    <p className="text-gray-600 mb-4">
                      {collection.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <ImageIcon className="h-4 w-4" />
                      {artworks.length}{" "}
                      {artworks.length === 1 ? "artwork" : "artworks"}
                    </span>
                  </div>
                </div>
                {isOwner && (
                  <div className="flex items-center gap-2">
                    {collection.visibility !== "public" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePublishToggle}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Publish
                      </Button>
                    )}
                    {collection.visibility === "public" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePublishToggle}
                      >
                        <EyeOff className="h-4 w-4 mr-2" />
                        Unpublish
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDelete}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Artworks Grid */}
          {artworks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {artworks.map((artwork: any) => (
                <div key={artwork.id} className="relative group">
                  <ArtworkCard
                    id={artwork.id}
                    image={artwork.photos?.[0] || "/placeholder.svg"}
                    title={artwork.title || "Untitled"}
                    artist={artwork.artist || "Unknown Artist"}
                    price={`$${artwork.desiredPrice?.toLocaleString() || "0"}`}
                    year={artwork.yearOfArtwork || "N/A"}
                    medium={artwork.technique || "N/A"}
                    dimensions={
                      artwork.dimensions &&
                      typeof artwork.dimensions === "object"
                        ? `${artwork.dimensions.height || 0}x${
                            artwork.dimensions.width || 0
                          } cm`
                        : "N/A"
                    }
                    seller={artwork.user?.name || "Unknown"}
                  />
                  {isOwner && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                      onClick={() => handleRemoveArtwork(artwork.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FolderOpen}
              title="No Artworks in Collection"
              description={
                isOwner
                  ? "This collection is empty. Add artworks to get started!"
                  : "This collection doesn't have any artworks yet."
              }
              actionLabel={isOwner ? "Browse Artworks" : undefined}
              onAction={isOwner ? () => navigate("/buyart") : undefined}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
