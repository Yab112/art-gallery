import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMyCollections } from "@/queries/collectionQueries";
import { useAddArtworkToCollection } from "@/api/collections/useAddArtworkToCollection";
import { FolderPlus, Loader2, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { collectionKeys } from "@/queries/queryKeys";
import { useNavigate } from "react-router-dom";

interface ArtworkCollectionManagerProps {
  artworkId: string;
}

export function ArtworkCollectionManager({ artworkId }: ArtworkCollectionManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
  const { data, isLoading } = useMyCollections(1, 100); // Get all collections
  const { addArtwork, isAdding } = useAddArtworkToCollection();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const collections = data?.collections || [];

  const handleAddToCollection = async () => {
    if (!selectedCollectionId) {
      toast.error("Please select a collection");
      return;
    }

    try {
      await addArtwork(selectedCollectionId, artworkId);
      queryClient.invalidateQueries({ queryKey: collectionKeys.detail(selectedCollectionId) });
      setIsOpen(false);
      setSelectedCollectionId("");
    } catch (error: any) {
      console.error("Failed to add artwork to collection:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full rounded-full border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
        >
          <FolderPlus className="h-4 w-4 mr-2" />
          Add to Collection
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Add to Collection
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Select a collection to add this artwork to.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : collections.length === 0 ? (
            <div className="p-6 text-center bg-gray-50 rounded-lg">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-700 font-medium mb-2">No collections yet</p>
              <p className="text-sm text-gray-500 mb-4">
                Create your first collection to organize your favorite artworks.
              </p>
              <Button
                className="bg-red-700 hover:bg-red-800 text-white rounded-full"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/profile/collections");
                }}
              >
                Create Collection
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {collections.map((collection) => (
                  <button
                    key={collection.id}
                    type="button"
                    onClick={() => setSelectedCollectionId(collection.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedCollectionId === collection.id
                        ? "border-red-700 bg-red-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FolderOpen className={`h-5 w-5 flex-shrink-0 ${
                        selectedCollectionId === collection.id
                          ? "text-red-700"
                          : "text-gray-500"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium text-sm ${
                          selectedCollectionId === collection.id
                            ? "text-red-900"
                            : "text-gray-900"
                        }`}>
                          {collection.name}
                        </div>
                        {collection.description && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {collection.description}
                          </div>
                        )}
                      </div>
                      {selectedCollectionId === collection.id && (
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-700 flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false);
                    setSelectedCollectionId("");
                  }}
                  disabled={isAdding}
                  className="rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddToCollection}
                  disabled={!selectedCollectionId || isAdding}
                  className="bg-red-700 hover:bg-red-800 text-white rounded-full"
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add to Collection"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

