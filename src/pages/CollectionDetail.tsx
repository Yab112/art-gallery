import { useParams, useNavigate } from "react-router-dom";
import { useCollection } from "@/queries/collectionQueries";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { EmptyState } from "@/components/ui/empty-state";
import {
  FolderOpen,
  ArrowLeft,
  Trash2,
  Image as ImageIcon,
  Edit2,
  Plus,
  Grid3x3,
  List,
  X,
  Loader2,
} from "lucide-react";
import { ArtworkCard } from "@/components/artwork-card";
import { Button } from "@/components/ui/button";
import { useRemoveArtworkFromCollection } from "@/services/collections/useRemoveArtworkFromCollection";
import { usePublishCollection } from "@/services/collections/usePublishCollection";
import { useUnpublishCollection } from "@/services/collections/useUnpublishCollection";
import { useUpdateCollection } from "@/services/collections/useUpdateCollection";
import { useQueryClient } from "@tanstack/react-query";
import { collectionKeys } from "@/queries/queryKeys";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useDeleteCollection } from "@/services/collections/useDeleteCollection";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetPresignedImageUploadUrl } from "@/queries/uploadQueries";
import { uploadFileToS3 } from "@/services/upload";
import { Upload } from "lucide-react";
import { mapArtworkToCardProps } from "@/lib/utils/artwork-mapper";
import { CollectionDetailSkeleton } from "@/components/skeletons/collection-detail-skeleton";

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, isLoading, error } = useCollection(id || "");
  const { removeArtwork: removeArtworkFromCollection } =
    useRemoveArtworkFromCollection();
  const { publishCollection } = usePublishCollection();
  const { unpublishCollection } = useUnpublishCollection();
  const { updateCollection, isUpdating } = useUpdateCollection();
  const { deleteCollection } = useDeleteCollection();
  const { mutateAsync: getPresignedUrl } = useGetPresignedImageUploadUrl();
  const queryClient = useQueryClient();

  const collection = data?.collection;
  const isOwner = collection?.createdBy === user?.id;

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    visibility: "private" as "public" | "private" | "unlisted",
    coverImage: "",
  });
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState("");
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // View mode state
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Add artwork - navigate to artworks page with collection ID
  const handleAddArtwork = () => {
    if (id) {
      navigate(`/buyart?addToCollection=${id}`);
    }
  };

  // Initialize edit form when collection loads
  useEffect(() => {
    if (collection) {
      setEditForm({
        name: collection.name || "",
        description: collection.description || "",
        visibility: (collection.visibility as "public" | "private" | "unlisted") || "private",
        coverImage: collection.coverImage || "",
      });
    }
  }, [collection]);

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
      } else {
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
      }
      queryClient.invalidateQueries({ queryKey: collectionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
    } catch (error: any) {
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
        navigate("/profile/collections");
      } catch (error: any) {
        toast.error(
          "Failed to delete collection: " +
            (error?.message || "An error occurred")
        );
      }
    }
  };

  const handleEditClick = () => {
    if (collection) {
      setEditForm({
        name: collection.name || "",
        description: collection.description || "",
        visibility: (collection.visibility as "public" | "private" | "unlisted") || "private",
        coverImage: collection.coverImage || "",
      });
      setCoverImageFile(null);
      setCoverImagePreview("");
      setIsEditModalOpen(true);
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateCollection = async () => {
    if (!id || !editForm.name.trim()) {
      toast.error("Collection name is required");
      return;
    }

    try {
      let coverImageUrl = editForm.coverImage;

      // Upload cover image if selected
      if (coverImageFile) {
        setIsUploadingCover(true);
        try {
          const presignedResponse = await getPresignedUrl({
            fileName: coverImageFile.name,
            contentType: coverImageFile.type,
          });

          if (!presignedResponse.success || !presignedResponse.presignedUrl) {
            throw new Error("Failed to get upload URL");
          }

          await uploadFileToS3(presignedResponse.presignedUrl, coverImageFile);
          coverImageUrl = presignedResponse.publicUrl;
        } catch (error: any) {
          toast.error("Failed to upload cover image: " + (error?.message || "An error occurred"));
          setIsUploadingCover(false);
          return;
        } finally {
          setIsUploadingCover(false);
        }
      }

      // Update collection
      await updateCollection(id, {
        ...editForm,
        coverImage: coverImageUrl || undefined,
      });

      // Refresh collection data
      queryClient.invalidateQueries({ queryKey: collectionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
      setIsEditModalOpen(false);
    } catch (error: any) {
      console.error("Failed to update collection:", error);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <CollectionDetailSkeleton />
      </ProtectedRoute>
    );
  }

  if (error || !collection) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon={FolderOpen}
          title="Collection Not Found"
          description="This collection doesn't exist or you don't have access to it."
          actionLabel="Back to Collections"
          onAction={() => navigate("/profile/collections")}
        />
      </div>
    );
  }

  // Handle artworks - backend returns artworks array directly
  const artworks = Array.isArray(collection?.artworks)
    ? collection.artworks
    : [];

  // Map artworks using the mapper utility
  const mappedArtworks = artworks.map((artwork: any) => mapArtworkToCardProps(artwork));

  // Split artworks: first 3 for right column, rest for continuous grid
  const featuredArtworks = mappedArtworks.slice(0, 3);
  const remainingArtworks = mappedArtworks.slice(3);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Cover Image Section */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
            <div className="w-full h-48 md:h-64 bg-gray-100 relative overflow-hidden">
              {collection.coverImage ? (
                <img
                  src={collection.coverImage}
                  alt={collection.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <FolderOpen className="h-16 w-16 md:h-24 md:w-24 text-gray-400" />
                </div>
              )}
              {/* Visibility Badge Overlay */}
              <div className="absolute top-3 right-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
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
              <div className="absolute top-3 left-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/profile/collections")}
                  className="bg-white/90 hover:bg-white backdrop-blur-sm h-8 w-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Collection Name Only */}
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {collection.name}
                </h1>
                {isOwner && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePublishToggle}
                      className="text-xs md:text-sm"
                    >
                      {collection.visibility === "public" ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditClick}
                      className="text-xs md:text-sm"
                    >
                      <Edit2 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDelete}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs md:text-sm"
                    >
                      <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Newspaper Style Layout: Description and Artworks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Left Column: Description */}
            <div className="lg:col-span-1">
              {collection.description && (
                <div className="border-l-2 border-gray-200 pl-4 py-2">
                  <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2.5">Description</h2>
                  <p className="text-sm text-gray-700 leading-relaxed break-words whitespace-normal">
                    {collection.description}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: Featured Artworks */}
            <div className="lg:col-span-1">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>
                    {artworks.length}{" "}
                    {artworks.length === 1 ? "artwork" : "artworks"}
                  </span>
                </div>
                {isOwner && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddArtwork}
                    className="h-7 px-2 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Artwork
                  </Button>
                )}
              </div>
              {featuredArtworks.length > 0 ? (
                <div className="flex justify-end gap-3">
                  {featuredArtworks.map((artwork) => (
                    <div key={artwork.id} className="relative group w-1/3">
                      <ArtworkCard {...artwork} />
                      {isOwner && (
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 z-20"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleRemoveArtwork(artwork.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded border border-gray-200 p-6 text-center">
                  <FolderOpen className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-600">No artworks in this collection yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Continuous Artworks Grid Below */}
          {remainingArtworks.length > 0 && (
            <div className="mb-4">
              <h2 className="text-base font-semibold text-gray-900 mb-3">
                All Artworks
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {remainingArtworks.map((artwork) => (
                  <div key={artwork.id} className="relative group">
                    <ArtworkCard {...artwork} />
                    {isOwner && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 z-10"
                        onClick={() => handleRemoveArtwork(artwork.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {mappedArtworks.length === 0 && (
            <EmptyState
              icon={FolderOpen}
              title="No Artworks in Collection"
              description={
                isOwner
                  ? "This collection is empty. Add artworks to get started!"
                  : "This collection doesn't have any artworks yet."
              }
              actionLabel={isOwner ? "Browse Artworks" : undefined}
              onAction={isOwner ? handleAddArtwork : undefined}
            />
          )}

          {/* Edit Collection Modal */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Collection</DialogTitle>
                <DialogDescription>
                  Update your collection details below.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Collection Name *</Label>
                  <Input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    placeholder="My Collection"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    placeholder="Describe your collection..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-visibility">Visibility</Label>
                  <Select
                    value={editForm.visibility}
                    onValueChange={(value: "public" | "private" | "unlisted") =>
                      setEditForm({ ...editForm, visibility: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="unlisted">Unlisted</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-cover">Cover Image</Label>
                  <div className="mt-2 space-y-2">
                    {coverImagePreview || collection.coverImage ? (
                      <div className="relative w-full h-32 rounded-md overflow-hidden border border-gray-200">
                        <img
                          src={coverImagePreview || collection.coverImage}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => {
                            setCoverImageFile(null);
                            setCoverImagePreview("");
                            setEditForm({ ...editForm, coverImage: "" });
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : null}
                    <label
                      htmlFor="edit-cover-upload"
                      className="flex items-center justify-center w-full h-10 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-gray-400 transition-colors"
                    >
                      <Upload className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {coverImagePreview || collection.coverImage
                          ? "Change Cover Image"
                          : "Upload Cover Image"}
                      </span>
                      <input
                        id="edit-cover-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCoverImageChange}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                    disabled={isUpdating || isUploadingCover}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateCollection}
                    disabled={isUpdating || isUploadingCover}
                  >
                    {isUpdating || isUploadingCover ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {isUploadingCover ? "Uploading..." : "Saving..."}
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

        </div>
      </div>
    </ProtectedRoute>
  );
}
