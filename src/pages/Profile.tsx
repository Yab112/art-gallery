import { useMyProfile } from "@/queries/userQueries";
import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Calendar,
  Image as ImageIcon,
  Edit,
  FolderPlus,
  FolderOpen,
  Eye,
  EyeOff,
  Trash2,
  Upload,
  X,
  Plus,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { EmptyState } from "@/components/ui/empty-state";
import { Palette } from "lucide-react";
import { useMyCollections } from "@/queries/collectionQueries";
import { useMyArtworks } from "@/queries/artworkQueries";
import { ArtworkCard } from "@/components/artwork-card";
import { useCreateCollection } from "@/services/collections/useCreateCollection";
import { useDeleteCollection } from "@/services/collections/useDeleteCollection";
import { usePublishCollection } from "@/services/collections/usePublishCollection";
import { useUnpublishCollection } from "@/services/collections/useUnpublishCollection";
import { useDeleteArtwork } from "@/services/artwork/useDeleteArtwork";
import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { collectionKeys, artworkKeys } from "@/queries/queryKeys";
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
import { toast } from "sonner";
import { useGetPresignedImageUploadUrl } from "@/queries/uploadQueries";
import { uploadFileToS3 } from "@/services/upload";
import { ProfileSkeleton } from "@/components/profile/profile-skeleton";
import { ProfileSectionSkeleton } from "@/components/skeletons/profile-section-skeleton";

export default function ProfilePage() {
  const { user: sessionUser } = useAuth();
  const navigate = useNavigate();
  const { data: profileData, isLoading, error } = useMyProfile();
  const { data: collectionsData, isLoading: isLoadingCollections } =
    useMyCollections(1, 10);
  const { data: artworksData, isLoading: isLoadingArtworks } = useMyArtworks(
    1,
    3
  );
  const { createCollection, isCreating } = useCreateCollection();
  const { deleteCollection, isDeleting } = useDeleteCollection();
  const { publishCollection } = usePublishCollection();
  const { unpublishCollection } = useUnpublishCollection();
  const { deleteArtwork, isDeleting: isDeletingArtwork } = useDeleteArtwork();
  const { mutateAsync: getPresignedUrl } = useGetPresignedImageUploadUrl();
  const queryClient = useQueryClient();
  const [showCreateCollection, setShowCreateCollection] = useState(false);

  const handleDeleteArtwork = async (artworkId: string) => {
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
  const [newCollection, setNewCollection] = useState({
    name: "",
    description: "",
    visibility: "private",
    coverImage: "",
  });
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>("");
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon={User}
          title="Error Loading Profile"
          description="Failed to load your profile. Please try again later."
        />
      </div>
    );
  }

  const profile = profileData?.profile || sessionUser;

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon={User}
          title="Profile Not Found"
          description="We couldn't find your profile information."
        />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Cover Image */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
            <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
              {(profile as any).coverImage ? (
                <img
                  src={(profile as any).coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-sm">No cover image</p>
                  </div>
                </div>
              )}
            </div>
            {/* Header */}
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4 -mt-16">
                  <div className="relative">
                    {profile.image ? (
                      <img
                        src={profile.image}
                        alt={profile.name || "User"}
                        className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                        <User className="h-10 w-10 text-red-700" />
                      </div>
                    )}
                  </div>
                  <div className="mt-12">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {profile.name || "User"}
                    </h1>
                    <p className="text-gray-500 mt-1">{profile.email}</p>
                    {"role" in profile && profile.role && (
                      <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                        {profile.role}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  asChild
                >
                  <Link to="/profile/edit">
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Account Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Account Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-900">{profile.email}</p>
                      {profile.emailVerified ? (
                        <span className="text-xs text-green-600 mt-1">
                          ✓ Verified
                        </span>
                      ) : (
                        <span className="text-xs text-yellow-600 mt-1">
                          ⚠ Not verified
                        </span>
                      )}
                    </div>
                  </div>
                  {profile.createdAt && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Member Since</p>
                        <p className="text-gray-900">
                          {new Date(profile.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                  {"artworkCount" in profile &&
                    profile.artworkCount !== undefined && (
                      <div className="flex items-center space-x-3">
                        <Palette className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Artworks</p>
                          <p className="text-gray-900">
                            {profile.artworkCount}{" "}
                            {profile.artworkCount === 1
                              ? "artwork"
                              : "artworks"}
                          </p>
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* My Artworks */}
              {isLoadingArtworks ? (
                <ProfileSectionSkeleton />
              ) : artworksData?.artworks && artworksData.artworks.length > 0 ? (
                <>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-900">
                        My Artworks
                      </h2>
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/sellart">Add New Artwork</Link>
                      </Button>
                    </div>
                    <p className="text-gray-600 mb-4">
                      You have{" "}
                      {artworksData.total || artworksData.artworks.length}{" "}
                      {(artworksData.total || artworksData.artworks.length) ===
                      1
                        ? "artwork"
                        : "artworks"}{" "}
                      in your collection.
                    </p>
                    {/* Artworks Preview Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      {artworksData.artworks.slice(0, 3).map((artwork) => (
                        <div key={artwork.id} className="relative group">
                          <Link
                            to={`/artwork/${artwork.id}`}
                            className="block"
                          >
                            <ArtworkCard
                              id={artwork.id}
                              image={artwork.photos?.[0] || "/placeholder.svg"}
                              title={artwork.title || "Untitled"}
                              artist={artwork.artist || "Unknown"}
                              price={`$${
                                artwork.desiredPrice?.toLocaleString() || "0"
                              }`}
                              year={artwork.yearOfArtwork || "N/A"}
                              medium={artwork.support || "N/A"}
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
                          </Link>
                          {/* Edit and Delete Buttons */}
                          <div 
                            className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            onClick={(e) => e.stopPropagation()}
                          >
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
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteArtwork(artwork.id);
                              }}
                              disabled={isDeletingArtwork}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* View All Button */}
                    {(artworksData.total || artworksData.artworks.length) >
                      3 && (
                      <div className="mt-4 flex justify-center">
                        <Button variant="outline" asChild>
                          <Link to="/profile/my-artworks">
                            View All My Artworks (
                            {artworksData.total || artworksData.artworks.length}
                            )
                          </Link>
                        </Button>
                      </div>
                    )}
                    {artworksData.artworks.length <= 3 && (
                      <div className="mt-4 flex justify-center">
                        <Button variant="link" asChild>
                          <Link to="/profile/my-artworks">
                            View All My Artworks
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              ) : "artworkCount" in profile &&
                profile.artworkCount !== undefined &&
                profile.artworkCount > 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      My Artworks
                    </h2>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/sellart">Add New Artwork</Link>
                    </Button>
                  </div>
                  <p className="text-gray-600">
                    You have{" "}
                    {"artworkCount" in profile ? profile.artworkCount : 0}{" "}
                    {("artworkCount" in profile ? profile.artworkCount : 0) ===
                    1
                      ? "artwork"
                      : "artworks"}{" "}
                    in your collection.
                  </p>
                  <Button variant="link" className="mt-4" asChild>
                    <Link to="/profile/my-artworks">View All My Artworks</Link>
                  </Button>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      My Artworks
                    </h2>
                    <Button
                      onClick={() => navigate("/sellart")}
                      className="bg-red-700 hover:bg-red-800 text-white rounded-full flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Create Artwork
                    </Button>
                  </div>
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                      <Palette className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-gray-500">
                      No Artworks Yet
                    </h3>
                  </div>
                </div>
              )}

              {/* My Collections */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <FolderOpen className="h-5 w-5 text-red-700" />
                    <h2 className="text-xl font-semibold text-gray-900 ">
                      My Collections
                    </h2>
                  </div>
                  <Button
                    onClick={() =>
                      setShowCreateCollection(!showCreateCollection)
                    }
                    className="bg-red-700 hover:bg-red-800 text-white rounded-full flex items-center gap-2"
                  >
                    <FolderPlus className="h-4 w-4" />
                    {showCreateCollection ? "Cancel" : "New Collection"}
                  </Button>
                </div>

                {/* Create Collection Form */}
                {showCreateCollection && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Create New Collection
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="collectionName">
                          Collection Name *
                        </Label>
                        <Input
                          id="collectionName"
                          value={newCollection.name}
                          onChange={(e) =>
                            setNewCollection({
                              ...newCollection,
                              name: e.target.value,
                            })
                          }
                          placeholder="Enter collection name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="collectionDescription">
                          Description
                        </Label>
                        <Textarea
                          id="collectionDescription"
                          value={newCollection.description}
                          onChange={(e) =>
                            setNewCollection({
                              ...newCollection,
                              description: e.target.value,
                            })
                          }
                          placeholder="Enter collection description (optional)"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="collectionCoverImage">
                          Cover Image (Optional)
                        </Label>
                        <div className="space-y-2">
                          {coverImagePreview ? (
                            <div className="relative">
                              <img
                                src={coverImagePreview}
                                alt="Cover preview"
                                className="w-full h-48 object-cover rounded-lg border border-gray-200"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={() => {
                                  setCoverImageFile(null);
                                  setCoverImagePreview("");
                                  setNewCollection({
                                    ...newCollection,
                                    coverImage: "",
                                  });
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div 
                              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                              onClick={() => coverImageInputRef.current?.click()}
                            >
                              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                              <Label
                                htmlFor="coverImageInput"
                                className="cursor-pointer text-sm text-gray-600 hover:text-gray-900"
                              >
                                Click to upload cover image
                              </Label>
                              <Input
                                ref={coverImageInputRef}
                                id="coverImageInput"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;

                                  // Validate file size (max 5MB)
                                  if (file.size > 5 * 1024 * 1024) {
                                    toast.error(
                                      "Image size must be less than 5MB"
                                    );
                                    return;
                                  }

                                  // Validate file type
                                  if (!file.type.startsWith("image/")) {
                                    toast.error("Please select an image file");
                                    return;
                                  }

                                  setCoverImageFile(file);
                                  setCoverImagePreview(
                                    URL.createObjectURL(file)
                                  );
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="collectionVisibility">Visibility</Label>
                        <Select
                          value={newCollection.visibility}
                          onValueChange={(value) =>
                            setNewCollection({
                              ...newCollection,
                              visibility: value,
                            })
                          }
                        >
                          <SelectTrigger id="collectionVisibility">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="private">Private</SelectItem>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="unlisted">Unlisted</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={async () => {
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
                                const presignedResponse = await getPresignedUrl(
                                  {
                                    fileName: coverImageFile.name,
                                    contentType: coverImageFile.type,
                                  }
                                );

                                if (
                                  !presignedResponse.success ||
                                  !presignedResponse.presignedUrl
                                ) {
                                  throw new Error("Failed to get upload URL");
                                }

                                await uploadFileToS3(
                                  presignedResponse.presignedUrl,
                                  coverImageFile
                                );

                                coverImageUrl = presignedResponse.publicUrl;
                                toast.success(
                                  "Cover image uploaded successfully"
                                );
                              } catch (error: any) {
                                toast.error(
                                  "Failed to upload cover image: " +
                                    (error?.message || "An error occurred")
                                );
                                setIsUploadingCover(false);
                                return;
                              } finally {
                                setIsUploadingCover(false);
                              }
                            }

                            // Create collection with cover image URL
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
                            setShowCreateCollection(false);

                            // Invalidate queries
                            queryClient.invalidateQueries({
                              queryKey: collectionKeys.lists(),
                            });

                            // Navigate to collection detail page
                            if (response?.collection?.id) {
                              navigate(
                                `/collections/${response.collection.id}`
                              );
                            }
                          } catch (error) {
                            // Error handled by hook
                          }
                        }}
                        disabled={isCreating || isUploadingCover}
                        className="bg-red-700 hover:bg-red-800 text-white"
                      >
                        {isUploadingCover
                          ? "Uploading cover..."
                          : isCreating
                          ? "Creating..."
                          : "Create Collection"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Collections List */}
                {isLoadingCollections ? (
                  <ProfileSectionSkeleton />
                ) : collectionsData?.collections &&
                  collectionsData.collections.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {collectionsData.collections
                        .slice(0, 3)
                        .map((collection) => (
                          <Link
                            key={collection.id}
                            to={`/collections/${collection.id}`}
                            className="block"
                          >
                            <div className="group relative">
                              {/* Cover Image - Same aspect ratio as artwork cards */}
                              <div className="relative mb-4 overflow-hidden bg-gray-100 aspect-[4/5]">
                                {collection.coverImage ? (
                                  <img
                                    src={collection.coverImage}
                                    alt={collection.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center bg-gray-200">
                                    <FolderOpen className="h-12 w-12 text-gray-400" />
                                  </div>
                                )}
                                {/* Visibility Badge Overlay */}
                                <div className="absolute top-3 right-3 z-10">
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

                              {/* Collection Details - Same style as artwork card */}
                              <div className="space-y-1">
                                <h3 className="font-semibold text-black text-sm uppercase tracking-wide line-clamp-1">
                                  {collection.name}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <ImageIcon className="h-3 w-3" />
                                  <span>
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
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2 pt-3 border-t border-gray-100 mt-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    try {
                                      if (
                                        collection.visibility === "public"
                                      ) {
                                        await unpublishCollection(
                                          collection.id
                                        );
                                      } else {
                                        await publishCollection(
                                          collection.id
                                        );
                                      }
                                      queryClient.invalidateQueries({
                                        queryKey: collectionKeys.lists(),
                                      });
                                    } catch (error) {
                                      // Error handled by hook
                                    }
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
                                    if (
                                      window.confirm(
                                        "Are you sure you want to delete this collection?"
                                      )
                                    ) {
                                      try {
                                        await deleteCollection(collection.id);
                                        queryClient.invalidateQueries({
                                          queryKey: collectionKeys.lists(),
                                        });
                                      } catch (error) {
                                        // Error handled by hook
                                      }
                                    }
                                  }}
                                  disabled={isDeleting}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </Link>
                        ))}
                    </div>
                    {/* See All Collections Button */}
                    {collectionsData.collections.length > 3 && (
                      <div className="mt-6 flex justify-center">
                        <Button variant="outline" asChild>
                          <Link to="/profile/collections">
                            View All Collections (
                            {collectionsData.collections.length})
                          </Link>
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                      <FolderOpen className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-gray-500">
                      No Collections Yet
                    </h3>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h2>
                <div className="space-y-2">
                  <Button className="w-full justify-start  border-0" asChild>
                    <Link to="/sellart">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Sell Artwork
                    </Link>
                  </Button>
                  <Button
                    className="w-full justify-start bg-[#053352] text-white hover:bg-[#042a47] border-0"
                    asChild
                  >
                    <Link to="/profile/my-artworks">
                      <Palette className="h-4 w-4 mr-2" />
                      My Artworks
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Account Stats */}
              {"score" in profile && profile.score !== undefined && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Account Stats
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Score</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {profile.score || 0}
                      </p>
                    </div>
                    {"artworkCount" in profile &&
                      profile.artworkCount !== undefined && (
                        <div>
                          <p className="text-sm text-gray-500">Artworks</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {profile.artworkCount}
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
