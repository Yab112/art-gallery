import { useState } from "react";
import { useMyCollections } from "@/queries/collectionQueries";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { EmptyState } from "@/components/ui/empty-state";
import { FolderOpen, Plus, Eye, EyeOff, Trash2, Image as ImageIcon, ArrowLeft, Upload, X, Loader2, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useDeleteCollection } from "@/services/collections/useDeleteCollection";
import { usePublishCollection } from "@/services/collections/usePublishCollection";
import { useUnpublishCollection } from "@/services/collections/useUnpublishCollection";
import { useCreateCollection } from "@/services/collections/useCreateCollection";
import { useQueryClient } from "@tanstack/react-query";
import { collectionKeys } from "@/queries/queryKeys";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { CollectionsSkeleton } from "@/components/skeletons/collections-skeleton";

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

export default function CollectionsPage() {
  const [page, setPage] = useState(1);
  const limit = 12;
  const navigate = useNavigate();
  const { data, isLoading, error } = useMyCollections(page, limit);
  const { deleteCollection, isDeleting } = useDeleteCollection();
  const { publishCollection } = usePublishCollection();
  const { unpublishCollection } = useUnpublishCollection();
  const { createCollection, isCreating } = useCreateCollection();
  const { mutateAsync: getPresignedUrl } = useGetPresignedImageUploadUrl();
  const queryClient = useQueryClient();

  // View mode state
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Create collection modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCollection, setNewCollection] = useState({
    name: "",
    description: "",
    visibility: "private",
    coverImage: "",
  });
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>("");
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  
  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<string | null>(null);

  const collections = data?.collections || [];
  const pagination = data ? {
    page: data.page || 1,
    limit: data.limit || limit,
    total: data.total || 0,
    pages: data.pages || 1,
  } : { page: 1, limit, total: 0, pages: 1 };

  const handleDeleteClick = (collectionId: string) => {
    setCollectionToDelete(collectionId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!collectionToDelete) return;
    
    try {
      await deleteCollection(collectionToDelete);
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
      setDeleteDialogOpen(false);
      setCollectionToDelete(null);
      toast.success("Collection deleted successfully");
    } catch (error: any) {
      toast.error("Failed to delete collection: " + (error?.message || "An error occurred"));
    }
  };

  const minArtworksToPublish = 3;

  const handlePublishToggle = async (
    collectionId: string,
    currentVisibility: string,
    artworkCount: number = 0
  ) => {
    try {
      if (currentVisibility === "public") {
        await unpublishCollection(collectionId);
      } else {
        if (artworkCount < minArtworksToPublish) {
          toast.error(
            `Collection must have at least ${minArtworksToPublish} artworks to be published. Currently has ${artworkCount}.`
          );
          return;
        }
        await publishCollection(collectionId);
      }
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
    } catch (error: any) {
      // Error handled by hook
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

  const handleCreateCollection = async () => {
    if (!newCollection.name.trim()) {
      toast.error("Collection name is required");
      return;
    }

    try {
      let coverImageUrl = newCollection.coverImage;

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

      // Create collection
      const response = await createCollection({
        ...newCollection,
        coverImage: coverImageUrl || undefined,
      });

      // Reset form
      setNewCollection({
        name: "",
        description: "",
        visibility: "private",
        coverImage: "",
      });
      setCoverImageFile(null);
      setCoverImagePreview("");
      setIsCreateModalOpen(false);

      // Refresh collections list
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
      toast.success("Collection created successfully!");
    } catch (error: any) {
      toast.error("Failed to create collection: " + (error?.message || "An error occurred"));
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <CollectionsSkeleton />
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon={FolderOpen}
          title="Error Loading Collections"
          description="Failed to load your collections. Please try again later."
        />
      </div>
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
                <h1 className="text-xl font-semibold text-gray-900">My Collections</h1>
                <span className="text-sm text-gray-500">
                  ({pagination.total})
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* View Mode Toggle */}
                <div className="flex items-center gap-0.5 border border-gray-300 rounded-md p-0.5 bg-gray-50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={`h-7 px-2 ${viewMode === "grid" ? "bg-white shadow-sm" : "bg-transparent hover:bg-transparent"}`}
                  >
                    <Grid className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={`h-7 px-2 ${viewMode === "list" ? "bg-white shadow-sm" : "bg-transparent hover:bg-transparent"}`}
                  >
                    <List className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1.5 h-7 px-3 text-sm"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create
                </Button>
              </div>
            </div>
          </div>

          {/* Collections Display */}
          {collections.length > 0 ? (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {collections.map((collection) => (
                    <Link
                      key={collection.id}
                      to={`/collections/${collection.id}`}
                      className="block group"
                    >
                      <div className="border border-gray-200 rounded-md overflow-hidden hover:border-gray-300 transition-colors bg-white">
                        {/* Cover Image */}
                        <div className="w-full h-32 bg-gray-100 relative overflow-hidden">
                          {collection.coverImage ? (
                            <img
                              src={collection.coverImage}
                              alt={collection.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                              <FolderOpen className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          {/* Visibility Badge */}
                          <div className="absolute top-2 right-2">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                collection.visibility === "public"
                                  ? "bg-green-500 text-white"
                                  : collection.visibility === "unlisted"
                                  ? "bg-yellow-500 text-white"
                                  : "bg-gray-500 text-white"
                              }`}
                            >
                              {collection.visibility}
                            </span>
                          </div>
                        </div>

                        {/* Collection Info */}
                        <div className="p-3">
                          <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-1">
                            {collection.name}
                          </h3>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <ImageIcon className="h-3 w-3" />
                              {"artworkCount" in collection &&
                              collection.artworkCount !== undefined
                                ? collection.artworkCount
                                : 0}
                            </span>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                title={
                                  collection.visibility !== "public" &&
                                  (collection.artworkCount ?? 0) < minArtworksToPublish
                                    ? `Add at least ${minArtworksToPublish} artworks to publish`
                                    : undefined
                                }
                                disabled={
                                  collection.visibility !== "public" &&
                                  (collection.artworkCount ?? 0) < minArtworksToPublish
                                }
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  await handlePublishToggle(
                                    collection.id,
                                    collection.visibility,
                                    collection.artworkCount ?? 0
                                  );
                                }}
                                className="h-6 px-2 text-xs"
                              >
                                {collection.visibility === "public" ? "Unpublish" : "Publish"}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteClick(collection.id);
                                }}
                                disabled={isDeleting}
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {collections.map((collection) => (
                    <Link
                      key={collection.id}
                      to={`/collections/${collection.id}`}
                      className="block group"
                    >
                      <div className="border border-gray-200 rounded-md overflow-hidden hover:border-gray-300 transition-colors bg-white">
                        <div className="flex items-center">
                          {/* Cover Image - Horizontal */}
                          <div className="w-20 h-20 bg-gray-100 relative overflow-hidden flex-shrink-0">
                            {collection.coverImage ? (
                              <img
                                src={collection.coverImage}
                                alt={collection.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                <FolderOpen className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            {/* Visibility Badge */}
                            <div className="absolute top-1 right-1">
                              <span
                                className={`px-1 py-0.5 rounded text-[9px] font-medium ${
                                  collection.visibility === "public"
                                    ? "bg-green-500 text-white"
                                    : collection.visibility === "unlisted"
                                    ? "bg-yellow-500 text-white"
                                    : "bg-gray-500 text-white"
                                }`}
                              >
                                {collection.visibility}
                              </span>
                            </div>
                          </div>

                          {/* Collection Info - Horizontal */}
                          <div className="flex-1 px-3 py-2 flex items-center justify-between min-w-0">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 text-sm mb-0.5 truncate">
                                {collection.name}
                              </h3>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <ImageIcon className="h-3 w-3" />
                                {"artworkCount" in collection &&
                                collection.artworkCount !== undefined
                                  ? collection.artworkCount
                                  : 0}{" "}
                                {("artworkCount" in collection &&
                                collection.artworkCount !== undefined
                                  ? collection.artworkCount
                                  : 0) === 1
                                  ? "artwork"
                                  : "artworks"}
                              </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                title={
                                  collection.visibility !== "public" &&
                                  (collection.artworkCount ?? 0) < minArtworksToPublish
                                    ? `Add at least ${minArtworksToPublish} artworks to publish`
                                    : undefined
                                }
                                disabled={
                                  collection.visibility !== "public" &&
                                  (collection.artworkCount ?? 0) < minArtworksToPublish
                                }
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  await handlePublishToggle(
                                    collection.id,
                                    collection.visibility,
                                    collection.artworkCount ?? 0
                                  );
                                }}
                                className="h-7 px-2 text-xs"
                              >
                                {collection.visibility === "public" ? "Unpublish" : "Publish"}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteClick(collection.id);
                                }}
                                disabled={isDeleting}
                                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

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
              icon={FolderOpen}
              title="No Collections Yet"
              description="You haven't created any collections yet. Start organizing your artworks!"
              actionLabel="Create Collection"
              onAction={() => setIsCreateModalOpen(true)}
            />
          )}
        </div>
      </div>

      {/* Create Collection Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle>Create New Collection</DialogTitle>
            <DialogDescription>
              Create a new collection to organize your favorite artworks.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Collection Name *</Label>
              <Input
                id="name"
                value={newCollection.name}
                onChange={(e) =>
                  setNewCollection({ ...newCollection, name: e.target.value })
                }
                placeholder="My Collection"
                className="focus:ring-0 focus:ring-offset-0 focus:border-gray-300 border-gray-200 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-gray-300"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newCollection.description}
                onChange={(e) =>
                  setNewCollection({ ...newCollection, description: e.target.value })
                }
                placeholder="Describe your collection..."
                rows={4}
                className="focus:ring-0 focus:ring-offset-0 focus:border-gray-300 border-gray-200 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-gray-300"
              />
            </div>

            <div>
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                value={newCollection.visibility}
                onValueChange={(value: "private" | "unlisted") =>
                  setNewCollection({ ...newCollection, visibility: value })
                }
              >
                <SelectTrigger className="focus:ring-0 focus:ring-offset-0 focus:border-gray-300 border-gray-200 focus:outline-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="unlisted">Unlisted</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Collections need at least 3 artworks to be published. Publish from the collection page once you’ve added enough.
              </p>
            </div>

            <div>
              <Label htmlFor="cover">Cover Image</Label>
              <div className="mt-2 space-y-2">
                {coverImagePreview ? (
                  <div className="relative w-full h-32 rounded-md overflow-hidden border border-gray-200">
                    <img
                      src={coverImagePreview}
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
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : null}
                <label
                  htmlFor="cover-upload"
                  className="flex items-center justify-center w-full h-10 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {coverImagePreview ? "Change Cover Image" : "Upload Cover Image"}
                  </span>
                  <input
                    id="cover-upload"
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
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setNewCollection({
                    name: "",
                    description: "",
                    visibility: "private",
                    coverImage: "",
                  });
                  setCoverImageFile(null);
                  setCoverImagePreview("");
                }}
                disabled={isCreating || isUploadingCover}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateCollection}
                disabled={isCreating || isUploadingCover || !newCollection.name.trim()}
                className="bg-red-700 hover:bg-red-800 text-white rounded-full"
              >
                {isCreating || isUploadingCover ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isUploadingCover ? "Uploading..." : "Creating..."}
                  </>
                ) : (
                  "Create Collection"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Collection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this collection? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCollectionToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ProtectedRoute>
  );
}

