import { useParams, useNavigate } from "react-router-dom";
import { useArtwork } from "@/queries/artworkQueries";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { EmptyState } from "@/components/ui/empty-state";
import { Palette, ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditArtworkForm } from "@/components/sellArtWork/editArtworkForm";
import { useAuth } from "@/hooks/use-auth";
import type { Artwork } from "@/types/artwork.types";
import { useEffect } from "react";
import { EditArtworkSkeleton } from "@/components/skeletons/edit-artwork-skeleton";

export default function EditArtworkPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: artworkResponse, isLoading, error } = useArtwork(id || "");

  // Debug: Log the response to see what we're getting
  useEffect(() => {
    if (artworkResponse) {
      console.log("Edit Artwork Response:", artworkResponse);
      console.log("Edit Artwork Data:", artworkResponse?.artwork);
    }
  }, [artworkResponse]);

  // Handle different response formats
  // Backend returns { success: true, artwork } or just artwork directly
  const artwork = artworkResponse?.artwork 
    ? artworkResponse.artwork 
    : (artworkResponse && typeof artworkResponse === 'object' && 'id' in artworkResponse)
    ? artworkResponse as Artwork
    : undefined;

  const isOwner = artwork?.userId === user?.id;

  if (isLoading) {
    return (
      <ProtectedRoute>
        <EditArtworkSkeleton />
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon={Palette}
          title="Failed to Load Artwork"
          description={error instanceof Error ? error.message : "Please try again."}
          actionLabel="Back to My Artworks"
          onAction={() => navigate("/profile/my-artworks")}
        />
      </div>
    );
  }

  if (!artwork || !artwork.id) {
    // Log for debugging
    console.log("Edit Artwork Response:", artworkResponse);
    console.log("Edit Artwork:", artwork);
    console.log("Is Loading:", isLoading);
    console.log("Error:", error);
    
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon={Palette}
          title="Artwork Not Found"
          description="This artwork doesn't exist or you don't have access to it."
          actionLabel="Back to My Artworks"
          onAction={() => navigate("/profile/my-artworks")}
        />
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon={Palette}
          title="Access Denied"
          description="You can only edit your own artworks."
          actionLabel="Back to My Artworks"
          onAction={() => navigate("/profile/my-artworks")}
        />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="mr-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Palette className="h-6 w-6 text-red-700" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Edit Artwork
                  </h1>
                  <p className="text-gray-500 mt-1">
                    {artwork.title || "Untitled"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <EditArtworkForm artwork={artwork} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

