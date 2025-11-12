import { useState } from "react";
import { useMyCollections } from "@/queries/collectionQueries";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { EmptyState } from "@/components/ui/empty-state";
import { FolderOpen, Plus, Eye, EyeOff, Trash2, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useDeleteCollection } from "@/services/collections/useDeleteCollection";
import { usePublishCollection } from "@/services/collections/usePublishCollection";
import { useUnpublishCollection } from "@/services/collections/useUnpublishCollection";
import { useQueryClient } from "@tanstack/react-query";
import { collectionKeys } from "@/queries/queryKeys";
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

export default function CollectionsPage() {
  const [page, setPage] = useState(1);
  const limit = 12;
  const navigate = useNavigate();
  const { data, isLoading, error } = useMyCollections(page, limit);
  const { deleteCollection, isDeleting } = useDeleteCollection();
  const { publishCollection } = usePublishCollection();
  const { unpublishCollection } = useUnpublishCollection();
  const queryClient = useQueryClient();

  const collections = data?.collections || [];
  const pagination = data ? {
    page: data.page || 1,
    limit: data.limit || limit,
    total: data.total || 0,
    pages: data.pages || 1,
  } : { page: 1, limit, total: 0, pages: 1 };

  const handleDelete = async (collectionId: string) => {
    if (window.confirm("Are you sure you want to delete this collection? This action cannot be undone.")) {
      try {
        await deleteCollection(collectionId);
        queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
        toast.success("Collection deleted successfully");
      } catch (error: any) {
        toast.error("Failed to delete collection: " + (error?.message || "An error occurred"));
      }
    }
  };

  const handlePublishToggle = async (collectionId: string, currentVisibility: string) => {
    try {
      if (currentVisibility === "public") {
        await unpublishCollection(collectionId);
      } else {
        await publishCollection(collectionId);
      }
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
    } catch (error: any) {
      // Error handled by hook
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
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/profile")}
                  className="mr-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <FolderOpen className="h-6 w-6 text-red-700" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">My Collections</h1>
                  <p className="text-gray-500 mt-1">
                    {pagination.total} {pagination.total === 1 ? "collection" : "collections"}
                  </p>
                </div>
              </div>
              <Button variant="outline" className="flex items-center gap-2" asChild>
                <Link to="/profile">
                  <Plus className="h-4 w-4" />
                  Create Collection
                </Link>
              </Button>
            </div>
          </div>

          {/* Collections Grid */}
          {collections.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections.map((collection) => (
                  <Link
                    key={collection.id}
                    to={`/collections/${collection.id}`}
                    className="block"
                  >
                    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer bg-white">
                      {/* Cover Image */}
                      <div className="w-full h-48 bg-gray-100 relative overflow-hidden">
                        {collection.coverImage ? (
                          <img
                            src={collection.coverImage}
                            alt={collection.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <FolderOpen className="h-16 w-16 text-gray-400" />
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
                      </div>

                      {/* Collection Info */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1 text-lg line-clamp-1">
                          {collection.name}
                        </h3>
                        {collection.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3 min-h-[2.5rem]">
                            {collection.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                          <span className="flex items-center gap-1">
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
                        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              await handlePublishToggle(collection.id, collection.visibility);
                            }}
                            className="flex-1"
                          >
                            {collection.visibility === "public" ? (
                              <>
                                <EyeOff className="h-3 w-3 mr-1" />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3 mr-1" />
                                Publish
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              await handleDelete(collection.id);
                            }}
                            disabled={isDeleting}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
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
              icon={FolderOpen}
              title="No Collections Yet"
              description="You haven't created any collections yet. Start organizing your artworks!"
              actionLabel="Create Collection"
              onAction={() => navigate("/profile")}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

