import { ArtworkCard } from "@/components/artwork-card";
import { NewsBlogCard } from "@/components/blog/news-blog-card";
import { NewsBlogSkeleton } from "@/components/blog/news-blog-skeleton";
import { BlogEditSheet } from "@/components/blog/blog-edit-sheet";

import { NavigationTabs } from "@/components/artist/navigation-tabs";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ProfileSkeleton } from "@/components/profile/profile-skeleton";
import { ArtworkCardSkeleton } from "@/components/skeletons/artwork-card-skeleton";
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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MinimalButton } from "@/components/ui/minimal-button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { getArtworkPhotoUrl } from "@/lib/utils/artwork-photo";
import { useMyArtworks } from "@/queries/artworkQueries";
import { useMyCollections } from "@/queries/collectionQueries";
import { useFollowing } from "@/queries/followQueries";
import { artworkKeys, collectionKeys, userKeys } from "@/queries/queryKeys";
import { useGetPresignedImageUploadUrl } from "@/queries/uploadQueries";
import { useMyProfile, useUser } from "@/queries/userQueries";
import { useDeleteArtwork } from "@/services/artwork/useDeleteArtwork";
import {
  useGetBlogPosts,
  usePublishBlogPost,
  useDeleteBlogPost,
  useUnpublishBlogPost,
} from "@/services/blog";
import { useCreateCollection } from "@/services/collections/useCreateCollection";
import { useDeleteCollection } from "@/services/collections/useDeleteCollection";
import { usePublishCollection } from "@/services/collections/usePublishCollection";
import { useUnpublishCollection } from "@/services/collections/useUnpublishCollection";
import { uploadFileToS3 } from "@/services/upload";
import { useUpdateAvatar } from "@/services/users/useUpdateAvatar";
import { useUpdateProfile } from "@/services/users/useUpdateProfile";
import { getAvatarUrl } from "@/utils/avatar";
import { useQueryClient } from "@tanstack/react-query";
import {
  Award,
  BookOpen,
  Calendar,
  Edit,
  Eye,
  EyeOff,
  Flame,
  FolderOpen,
  FolderPlus,
  Globe,
  Images,
  MapPin,
  Mountain,
  Package,
  Phone,
  Plus,
  Share2,
  ThumbsUp,
  Trash2,
  Upload,
  User,
  X,
  ChevronDown,
  Palette,
  Users,
} from "lucide-react";
import { ShippingAddressForm } from "@/components/profile/ShippingAddressForm";
import { ShipmentsTab } from "@/components/profile/shipments-tab";
import { useRef, useState, useEffect } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user: sessionUser } = useAuth();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  // If userId is provided and different from current user, fetch that user's profile
  // Otherwise, fetch current user's profile
  const isViewingOtherProfile = userId && userId !== sessionUser?.id;
  const {
    data: otherUserData,
    isLoading: isLoadingOtherUser,
    error: otherUserError,
  } = useUser(userId || "");
  const {
    data: myProfileData,
    isLoading: isLoadingMyProfile,
    error: myProfileError,
  } = useMyProfile();

  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "artworks",
  );


  // Sync tab state with URL search params
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(1);
    setSearchParams({ tab }, { replace: true });
  };
  const [sortBy, setSortBy] = useState("newest");
  const [medium, setMedium] = useState("");
  const [page, setPage] = useState(1);

  // Blog Edit Sheet State
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [selectedBlogToEdit, setSelectedBlogToEdit] = useState<any | null>(
    null,
  );

  const handleEditBlog = (blog: any) => {
    setSelectedBlogToEdit(blog);
    setIsEditSheetOpen(true);
  };

  // Use the appropriate data based on whether we're viewing another user's profile
  const profileData = isViewingOtherProfile ? otherUserData : myProfileData;
  const isLoading = isViewingOtherProfile
    ? isLoadingOtherUser
    : isLoadingMyProfile;
  const error = isViewingOtherProfile ? otherUserError : myProfileError;

  const { data: collectionsData, isLoading: isLoadingCollections } =
    useMyCollections(1, 10);

  // Get profile ID for following query - use userId param or session user id
  const profileIdForFollowing = userId || sessionUser?.id;

  // Fetch artworks with filters
  const {
    data: artworksData,
    isLoading: isLoadingArtworks,
    isFetching: isFetchingArtworks,
  } = useMyArtworks({
    page: activeTab === "artworks" ? page : 1,
    limit: 12,
    status: isViewingOtherProfile ? "APPROVED" : undefined,
    technique: medium || undefined,
    sortBy:
      sortBy === "price-low" || sortBy === "price-high"
        ? "desiredPrice"
        : "createdAt",
    orderBy: sortBy === "price-low" || sortBy === "oldest" ? "asc" : "desc",
  });

  // Fetch blogs
  const { data: blogsData, isLoading: isLoadingBlogs } = useGetBlogPosts({
    authorId: profileIdForFollowing,
    published: isViewingOtherProfile ? true : undefined,
    page: activeTab === "blogs" ? page : 1,
    limit: 10,
  });

  // Mutations for blogs
  const publishBlog = usePublishBlogPost();
  const unpublishBlog = useUnpublishBlogPost();
  const deleteBlog = useDeleteBlogPost();

  const handlePublishBlog = async (postId: string) => {
    try {
      await publishBlog.mutateAsync(postId);
      toast.success("Blog post published successfully");
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
    } catch (error) {
      console.error("Failed to publish blog post:", error);
      toast.error("Failed to publish blog post");
    }
  };

  const handleUnpublishBlog = async (postId: string) => {
    try {
      await unpublishBlog.mutateAsync(postId);
      toast.success("Blog post unpublished successfully");
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
    } catch (error) {
      console.error("Failed to unpublish blog post:", error);
      toast.error("Failed to unpublish blog post");
    }
  };

  const handleDeleteBlog = async (postId: string) => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      try {
        await deleteBlog.mutateAsync(postId);
        toast.success("Blog post deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      } catch (error) {
        console.error("Failed to delete blog post:", error);
        toast.error("Failed to delete blog post");
      }
    }
  };

  // Fetch following users for avatars display
  const { data: followingData } = useFollowing(profileIdForFollowing, 1, 4);
  const followingUsers = followingData?.users || [];
  const { createCollection, isCreating } = useCreateCollection();
  const { deleteCollection, isDeleting } = useDeleteCollection();
  const { publishCollection, isPublishing } = usePublishCollection();
  const { unpublishCollection, isUnpublishing } = useUnpublishCollection();
  const { deleteArtwork, isDeleting: isDeletingArtwork } = useDeleteArtwork();
  const { mutateAsync: getPresignedUrl } = useGetPresignedImageUploadUrl();
  const { updateProfile, isUpdating: isUpdatingProfile } = useUpdateProfile();
  const { updateAvatar, isUpdating: isUpdatingAvatar } = useUpdateAvatar();
  const queryClient = useQueryClient();
  const [showCreateCollection, setShowCreateCollection] = useState(false);

  // Profile cover image state
  const [profileCoverImageFile, setProfileCoverImageFile] =
    useState<File | null>(null);
  const [profileCoverImagePreview, setProfileCoverImagePreview] =
    useState<string>("");
  const [isUploadingProfileCover, setIsUploadingProfileCover] = useState(false);
  const profileCoverImageInputRef = useRef<HTMLInputElement>(null);

  // Profile avatar state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [collectionImageErrors, setCollectionImageErrors] = useState<
    Record<string, boolean>
  >({});

  const handleDeleteArtwork = async (artworkId: string) => {
    if (window.confirm("Are you sure you want to delete this artwork?")) {
      try {
        await deleteArtwork(artworkId);
        queryClient.invalidateQueries({ queryKey: artworkKeys.myArtworks() });
        toast.success("Artwork deleted successfully");
      } catch (error: any) {
        toast.error(
          `Failed to delete artwork: ${error?.message || "An error occurred"}`,
        );
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

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<string | null>(
    null,
  );

  // Show loading only if we don't have any data at all
  if (isLoading && !profileData) {
    return <ProfileSkeleton />;
  }

  // Only show error if we don't have cached data
  if (error && !profileData) {
    console.error("Profile error:", error);
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

  // Debug: Log the profile data to see what we're getting
  console.log("Profile Data:", profileData);
  console.log("Profile Object:", profile);
  console.log("Profile Bio:", (profile as any)?.bio);
  console.log("Profile Heat Score:", (profile as any)?.heatScore);
  console.log("Profile Views:", (profile as any)?.profileViews);
  console.log("Profile Talent Types:", (profile as any)?.talentTypes);

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
      <div className="min-h-screen pb-12">
        {/* Cover Image - Full Width Black Banner */}
        <div className="px-4">
          <div
            className={`relative h-32 w-full bg-black sm:h-48 ${
              !isViewingOtherProfile ? "group cursor-pointer" : ""
            }`}
            onClick={() => {
              if (!isViewingOtherProfile) {
                profileCoverImageInputRef.current?.click();
              }
            }}
          >
            {profileCoverImagePreview ? (
              <img
                src={profileCoverImagePreview}
                alt="Cover preview"
                className="h-full w-full object-cover"
              />
            ) : (profile as any).coverImage ? (
              <img
                src={(profile as any).coverImage}
                alt="Cover"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <div className="text-center">
                  <div className="inline-block rounded-lg bg-gray-600 p-4">
                    <Mountain className="mx-auto h-12 w-12 text-gray-300" />
                  </div>
                </div>
              </div>
            )}
            {!isViewingOtherProfile && (
              <>
                {/* Full overlay with edit icon */}
                <div className="pointer-events-none absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center bg-black bg-opacity-0 transition-all group-hover:bg-opacity-10">
                  <Edit className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </>
            )}
          </div>
        </div>
        {/* Hidden file input for profile cover image */}
        {!isViewingOtherProfile && (
          <Input
            ref={profileCoverImageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              // Validate file size (max 5MB)
              if (file.size > 5 * 1024 * 1024) {
                toast.error("Image size must be less than 5MB");
                return;
              }

              // Validate file type
              if (!file.type.startsWith("image/")) {
                toast.error("Please select an image file");
                return;
              }

              setProfileCoverImageFile(file);
              setProfileCoverImagePreview(URL.createObjectURL(file));

              // Upload and update profile immediately
              setIsUploadingProfileCover(true);
              try {
                const presignedResponse = await getPresignedUrl({
                  fileName: file.name,
                  contentType: file.type,
                });

                if (
                  !presignedResponse.success ||
                  !presignedResponse.presignedUrl
                ) {
                  throw new Error("Failed to get upload URL");
                }

                await uploadFileToS3(presignedResponse.presignedUrl, file);
                const coverImageUrl = presignedResponse.publicUrl;

                // Update profile with new cover image
                await updateProfile({
                  coverImage: coverImageUrl,
                });

                // Refetch profile queries and wait for completion before clearing preview
                await queryClient.refetchQueries({ queryKey: userKeys.me() });
                if (profile?.id) {
                  await queryClient.refetchQueries({
                    queryKey: userKeys.detail(profile.id),
                  });
                }

                toast.success("Cover image updated successfully");

                // Clear preview after successful upload and data refetch
                setProfileCoverImageFile(null);
                setProfileCoverImagePreview("");
              } catch (error: any) {
                toast.error(
                  `Failed to upload cover image: ${error?.message || "An error occurred"}`,
                );
                // Reset preview on error
                setProfileCoverImageFile(null);
                setProfileCoverImagePreview("");
              } finally {
                setIsUploadingProfileCover(false);
                // Reset file input
                if (profileCoverImageInputRef.current) {
                  profileCoverImageInputRef.current.value = "";
                }
              }
            }}
          />
        )}

        <div className="container mx-auto mt-2 max-w-6xl px-4">
          {/* Profile Header */}
          <div className="mb-8">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-end">
                <div
                  className={`relative -mt-16 sm:-mt-20 ${!isViewingOtherProfile ? "group cursor-pointer" : ""}`}
                  onClick={() => {
                    if (!isViewingOtherProfile) {
                      avatarInputRef.current?.click();
                    }
                  }}
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt={profile.name || "User"}
                      className="h-32 w-32 rounded-full border-[6px] object-cover sm:h-48 sm:w-48 sm:border-[8px]"
                      style={{ borderColor: "#FFFFFF" }}
                    />
                  ) : profile.image ? (
                    <img
                      src={profile.image}
                      alt={profile.name || "User"}
                      className="h-32 w-32 rounded-full border-[6px] object-cover sm:h-48 sm:w-48 sm:border-[8px]"
                      style={{ borderColor: "#FFFFFF" }}
                    />
                  ) : (
                    <div
                      className="flex h-32 w-32 items-center justify-center rounded-full border-[6px] bg-red-600 sm:h-48 sm:w-48 sm:border-[8px]"
                      style={{ borderColor: "#FFFFFF" }}
                    >
                      <span className="font-bold text-3xl text-white sm:text-4xl">
                        {(profile.name || "U")[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  {!isViewingOtherProfile && (
                    <>
                      {/* Red edit icon at bottom-right - cutting into avatar */}
                      <div className="absolute right-1 bottom-1 z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-red-700">
                        <Edit className="h-4 w-4 text-white" />
                      </div>
                      {/* Hidden file input */}
                      <Input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          // Validate file size (max 5MB)
                          if (file.size > 5 * 1024 * 1024) {
                            toast.error("Image size must be less than 5MB");
                            return;
                          }

                          // Validate file type
                          if (!file.type.startsWith("image/")) {
                            toast.error("Please select an image file");
                            return;
                          }

                          setAvatarFile(file);
                          setAvatarPreview(URL.createObjectURL(file));

                          // Upload and update avatar immediately
                          setIsUploadingAvatar(true);
                          try {
                            const presignedResponse = await getPresignedUrl({
                              fileName: file.name,
                              contentType: file.type,
                            });

                            if (
                              !presignedResponse.success ||
                              !presignedResponse.presignedUrl
                            ) {
                              throw new Error("Failed to get upload URL");
                            }

                            await uploadFileToS3(
                              presignedResponse.presignedUrl,
                              file,
                            );
                            const avatarUrl = presignedResponse.publicUrl;

                            // Update avatar
                            await updateAvatar(avatarUrl);

                            // Refetch profile queries and wait for completion before clearing preview
                            await queryClient.refetchQueries({
                              queryKey: userKeys.me(),
                            });
                            if (profile?.id) {
                              await queryClient.refetchQueries({
                                queryKey: userKeys.detail(profile.id),
                              });
                            }

                            toast.success(
                              "Profile picture updated successfully",
                            );

                            // Clear preview after successful upload and data refetch
                            setAvatarFile(null);
                            setAvatarPreview("");
                          } catch (error: any) {
                            toast.error(
                              `Failed to upload profile picture: ${error?.message || "An error occurred"}`,
                            );
                            // Reset preview on error
                            setAvatarFile(null);
                            setAvatarPreview("");
                          } finally {
                            setIsUploadingAvatar(false);
                            // Reset file input
                            if (avatarInputRef.current) {
                              avatarInputRef.current.value = "";
                            }
                          }
                        }}
                      />
                    </>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="font-bold text-3xl text-gray-900 sm:text-4xl">
                    {profile.name || "User"}
                  </h1>

                  {/* Heat Score and Views */}
                  <div className="mt-2 flex flex-wrap justify-center gap-4 text-sm sm:justify-start">
                    {/* Heat Score */}
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-orange-500" />
                      <span className="text-gray-500">Heat Score:</span>
                      <span className="font-semibold text-gray-900">
                        {((profile as any)?.heatScore ?? 0).toFixed(1)}
                      </span>
                    </div>

                    {/* Profile Views */}
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500">Views:</span>
                      <span className="font-semibold text-gray-900">
                        {((profile as any)?.profileViews ?? 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Inline Stats with Following Avatars */}
                  <div className="mt-4 flex flex-wrap justify-center gap-4 sm:justify-start">
                    <Link
                      to={`/profile/${profile.id}/followers`}
                      className="text-gray-900 transition-colors hover:text-red-600"
                    >
                      <span className="font-semibold text-lg">
                        {(profile as any).followerCount || 0}
                      </span>
                      <span className="ml-1 text-gray-600">Followers</span>
                    </Link>
                    <div className="hidden h-4 w-px bg-gray-300 sm:block" />
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/profile/${profile.id}/following`}
                        className="text-gray-900 transition-colors hover:text-red-600"
                      >
                        <span className="font-semibold text-lg">
                          {(profile as any).followingCount || 0}
                        </span>
                        <span className="ml-1 text-gray-600">Following</span>
                      </Link>
                      {/* Following Avatars - Overlapping */}
                      {followingUsers.length > 0 && (
                        <div className="-space-x-4 ml-2 flex items-center">
                          {followingUsers.slice(0, 4).map((user, index) => (
                            <Link
                              key={user.id}
                              to={`/profile/${user.id}`}
                              className="relative block flex-shrink-0"
                              style={{ zIndex: 4 - index }}
                            >
                              <img
                                src={getAvatarUrl(
                                  user.image,
                                  user.name || "User",
                                  40,
                                )}
                                alt={user.name || "User"}
                                className="h-8 min-h-[2rem] w-8 min-w-[2rem] rounded-full border-2 border-white bg-gray-200 object-cover transition-transform hover:scale-110"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  const fallback = getAvatarUrl(
                                    null,
                                    user.name || "User",
                                    40,
                                  )
                                  if (target.src !== fallback) {
                                    target.src = fallback
                                  }
                                }}
                                loading="lazy"
                              />
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex w-full items-center justify-center gap-2 sm:w-auto">
                {!isViewingOtherProfile ? (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1 items-center gap-2 sm:flex-none"
                      asChild
                    >
                      <Link to="/profile/edit">
                        <Edit className="h-4 w-4" />
                        Edit Profile
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 items-center gap-2 sm:flex-none"
                      onClick={async () => {
                        const shareData = {
                          title: `${profile.name}'s Profile`,
                          text: `Check out ${profile.name}'s profile on our platform!`,
                          url: window.location.href,
                        };

                        try {
                          if (navigator.share) {
                            await navigator.share(shareData);
                          } else {
                            await navigator.clipboard.writeText(
                              window.location.href,
                            );
                            toast.success("Profile link copied to clipboard!");
                          }
                        } catch (err) {
                          console.error("Error sharing:", err);
                        }
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    className="flex-1 items-center gap-2 sm:flex-none"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          window.location.href,
                        );
                        toast.success("Profile link copied to clipboard!");
                      } catch (err) {
                        console.error("Error copying link:", err);
                      }
                    }}
                  >
                    <Globe className="h-4 w-4" />
                    Share Profile
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <NavigationTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            tabs={
              !isViewingOtherProfile
                ? [
                    { id: "artworks", label: "Artworks" },
                    { id: "collections", label: "Collections" },
                    { id: "blogs", label: "Blogs" },
                    { id: "about", label: "About" },
                    { id: "shipments", label: "Shipments" },
                    { id: "settings", label: "Settings" },
                  ]
                : [
                    { id: "artworks", label: "Artworks" },
                    { id: "collections", label: "Collections" },
                    { id: "blogs", label: "Blogs" },
                    { id: "about", label: "About" },
                  ]
            }
          />

          {/* Profile Information */}
          <div className="grid grid-cols-1 gap-6">
            {/* Main Content Area */}

            {/* ARTWORKS TAB */}
            {activeTab === "artworks" && (
              <div className="space-y-6">
                {/* Actions Bar */}
                {!isViewingOtherProfile && (
                  <div className="flex justify-end">
                    <Button
                      onClick={() => navigate("/sellart")}
                      className="bg-red-700 text-white hover:bg-red-800"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Artwork
                    </Button>
                  </div>
                )}

                {isLoadingArtworks ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[...Array(8)].map((_, i) => (
                      <ArtworkCardSkeleton key={i} />
                    ))}
                  </div>
                ) : artworksData?.artworks &&
                  artworksData.artworks.length > 0 ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {artworksData.artworks.map((artwork) => (
                        <div key={artwork.id} className="group relative">
                          <Link to={`/artwork/${artwork.id}`} className="block">
                            <ArtworkCard
                              id={artwork.id}
                              disableNavigation
                              image={getArtworkPhotoUrl(artwork.photos)}
                              title={artwork.title || "Untitled"}
                              artist={artwork.artist || "Unknown"}
                              price={`$${artwork.desiredPrice?.toLocaleString() || "0"}`}
                              year={artwork.yearOfArtwork || "N/A"}
                              medium={artwork.support || "N/A"}
                              dimensions={
                                artwork.dimensions &&
                                typeof artwork.dimensions === "object"
                                  ? `${artwork.dimensions.height || 0}x${artwork.dimensions.width || 0} cm`
                                  : "N/A"
                              }
                              seller={artwork.user?.name || "Unknown"}
                              status={artwork.status}
                            />
                          </Link>
                          {!isViewingOtherProfile && (
                            <div
                              className="absolute top-2 right-2 z-10 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100"
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
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {artworksData.pages > 1 && (
                      <PaginationControls
                        currentPage={page}
                        totalPages={artworksData.pages}
                        onPageChange={setPage}
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                      <Palette className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="mb-2 font-semibold text-gray-900 text-xl">
                      No Artworks Found
                    </h3>
                    <p className="mb-8 text-gray-500">
                      {!isViewingOtherProfile
                        ? "You haven't uploaded any artworks yet."
                        : "This user hasn't uploaded any artworks yet."}
                    </p>
                    {!isViewingOtherProfile && (
                      <Button
                        onClick={() => navigate("/sellart")}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Artwork
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* BLOGS TAB */}
            {activeTab === "blogs" && (
              <div className="space-y-6">
                {isLoadingBlogs ? (
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                      <NewsBlogSkeleton key={i} layout="STANDARD" />
                    ))}
                  </div>
                ) : blogsData?.data && blogsData.data.length > 0 ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                      {blogsData.data.map((post) => (
                        <div key={post.id} className="flex flex-col space-y-4">
                          <div className="group relative flex-1">
                            <NewsBlogCard
                              blogPost={post}
                              layout="STANDARD"
                              showStatus={!isViewingOtherProfile}
                            />
                          </div>

                          {/* Explicit Action Buttons for Owner */}
                          {!isViewingOtherProfile && (
                            <div className="flex flex-wrap items-center gap-2 border-gray-100 border-t pt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 flex-1 rounded-none border-black px-0 font-bold text-[10px] uppercase tracking-wider hover:bg-black hover:text-white"
                                onClick={() => handleEditBlog(post)}
                              >
                                <Edit className="mr-1.5 h-3 w-3" />
                                Edit
                              </Button>

                              {!post.published &&
                                post.status === "APPROVED" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 flex-1 rounded-none border-green-600 px-0 font-bold text-[10px] text-green-700 uppercase tracking-wider hover:bg-green-600 hover:text-white"
                                    onClick={() => handlePublishBlog(post.id)}
                                  >
                                    <ThumbsUp className="mr-1.5 h-3 w-3" />
                                    Publish
                                  </Button>
                                )}

                              {post.published && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 flex-1 rounded-none border-yellow-600 px-0 font-bold text-[10px] text-yellow-700 uppercase tracking-wider hover:bg-yellow-600 hover:text-white"
                                  onClick={() => handleUnpublishBlog(post.id)}
                                >
                                  <EyeOff className="mr-1.5 h-3 w-3" />
                                  Offline
                                </Button>
                              )}

                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 flex-none rounded-none border-red-600 px-3 font-bold text-[10px] text-red-700 uppercase tracking-wider hover:bg-red-600 hover:text-white"
                                onClick={() => handleDeleteBlog(post.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Pagination for Blogs */}
                    {blogsData.totalPages > 1 && (
                      <PaginationControls
                        currentPage={page}
                        totalPages={blogsData.totalPages}
                        onPageChange={setPage}
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center border-2 border-gray-100 border-dashed py-24 text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
                      <BookOpen className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="mb-2 font-black text-gray-900 text-xl uppercase tracking-tighter">
                      The Journal is Empty
                    </h3>
                    <p className="mb-8 max-w-xs text-gray-500 text-sm">
                      {!isViewingOtherProfile
                        ? "You haven't published any stories yet. Start sharing your artistic journey with the world."
                        : "This artist hasn't published any stories yet. Check back soon for updates."}
                    </p>
                    {!isViewingOtherProfile && (
                      <Button
                        onClick={() => navigate("/blog")}
                        className="h-12 rounded-none bg-black px-8 font-black text-white text-xs uppercase tracking-[0.2em] transition-all hover:bg-red-700"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Write Your First Story
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ABOUT TAB */}
            {activeTab === "about" && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-6 md:col-span-2">
                  {/* Bio Section */}
                  {((profile as any)?.bio ||
                    (profile as any)?.location ||
                    (profile as any)?.website ||
                    (profile as any)?.phone) && (
                    <div className="space-y-4">
                      {(profile as any)?.bio && (
                        <div className="rounded-lg border border-red-100/50 bg-red-50/30 p-5">
                          <h3 className="mb-2 font-medium text-gray-500 text-xs uppercase tracking-wide">
                            About
                          </h3>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {(profile as any).bio}
                          </p>
                        </div>
                      )}
                      {((profile as any)?.location ||
                        (profile as any)?.website ||
                        (profile as any)?.phone) && (
                        <div className="flex flex-wrap items-center gap-5 text-sm">
                          {(profile as any)?.location && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">
                                {(profile as any).location}
                              </span>
                            </div>
                          )}
                          {(profile as any)?.phone && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <a
                                href={`tel:${(profile as any).phone}`}
                                className="font-medium transition-colors hover:text-red-600"
                              >
                                {(profile as any).phone}
                              </a>
                            </div>
                          )}
                          {(profile as any)?.website && (
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-gray-500" />
                              <a
                                href={(profile as any).website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-red-600 transition-colors hover:text-red-700 hover:underline"
                              >
                                {(profile as any).website}
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Talent Types */}
                  {(profile as any)?.talentTypes &&
                    Array.isArray((profile as any).talentTypes) &&
                    (profile as any).talentTypes.length > 0 && (
                      <div className="rounded-md border border-gray-100 bg-white p-6">
                        <div className="mb-3 flex items-center gap-2">
                          <Award className="h-4 w-4 text-gray-400" />
                          <h2 className="font-medium text-gray-900 text-lg">
                            Talent Types
                          </h2>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(profile as any).talentTypes.map((tt: any) => (
                            <span
                              key={tt.id}
                              className="rounded-md border border-gray-200 px-2.5 py-1 text-gray-600 text-sm transition-colors hover:border-gray-300"
                            >
                              {tt.icon && (
                                <span className="mr-1">{tt.icon}</span>
                              )}
                              {tt.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                {/* Engagement Stats (Right Side on Desktop) */}
                <div className="space-y-6">
                  <div className="rounded-md border border-gray-100 bg-white p-6">
                    <h3 className="mb-4 font-semibold text-gray-900">
                      Engagement
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <Flame className="h-4 w-4" />
                          <span>Heat Score</span>
                        </div>
                        <span className="font-bold">
                          {((profile as any)?.heatScore ?? 0).toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <Eye className="h-4 w-4" />
                          <span>Total Views</span>
                        </div>
                        <span className="font-bold">
                          {(
                            (profile as any)?.profileViews ?? 0
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <Users className="h-4 w-4" />
                          <span>Followers</span>
                        </div>
                        <span className="font-bold">
                          {(profile as any).followerCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {(profile as any)?.createdAt && (
                    <div className="rounded-md border border-gray-100 bg-white p-6">
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Member since{" "}
                          {new Date(
                            (profile as any).createdAt,
                          ).toLocaleDateString(undefined, {
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* COLLECTIONS TAB */}
            {activeTab === "collections" && (
              <div className="space-y-6">
                {/* My Collections */}
                <div className="rounded-md border border-gray-100 bg-white p-6">
                  <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
                    <div className="flex items-center space-x-2">
                      <FolderOpen className="h-4 w-4 text-gray-400" />
                      <h2 className="font-medium text-gray-900 text-lg">
                        My Collections
                      </h2>
                    </div>
                    {showCreateCollection ? (
                      <button
                        onClick={() => setShowCreateCollection(false)}
                        className="text-gray-600 text-sm transition-colors hover:text-gray-900 hover:underline"
                      >
                        Cancel
                      </button>
                    ) : (
                      !isViewingOtherProfile && (
                        <MinimalButton
                          icon={FolderPlus}
                          onClick={() => setShowCreateCollection(true)}
                          variant="default"
                        >
                          New Collection
                        </MinimalButton>
                      )
                    )}
                  </div>

                  {/* Create Collection Form */}
                  {showCreateCollection && (
                    <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <h3 className="mb-4 font-semibold text-gray-900 text-lg">
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
                                  className="h-48 w-full rounded-lg border border-gray-200 object-cover"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-2 right-2 h-8 w-8"
                                  onClick={() => {
                                    setCoverImageFile(null);
                                    setCoverImagePreview("");
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div
                                className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-gray-300 border-dashed bg-white hover:border-gray-400 hover:bg-gray-50"
                                onClick={() =>
                                  coverImageInputRef.current?.click()
                                }
                              >
                                <Upload className="mb-2 h-8 w-8 text-gray-400" />
                                <p className="text-gray-500 text-sm">
                                  Click to upload cover image
                                </p>
                              </div>
                            )}
                            <Input
                              ref={coverImageInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                if (file.size > 5 * 1024 * 1024) {
                                  toast.error(
                                    "Image size must be less than 5MB",
                                  );
                                  return;
                                }
                                if (!file.type.startsWith("image/")) {
                                  toast.error("Please select an image file");
                                  return;
                                }
                                setCoverImageFile(file);
                                setCoverImagePreview(URL.createObjectURL(file));
                              }}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="collectionVisibility">
                            Visibility
                          </Label>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                id="collectionVisibility"
                                variant="outline"
                                className="w-full justify-between bg-white text-gray-900 border-gray-200"
                              >
                                <span className="capitalize">{newCollection.visibility}</span>
                                <ChevronDown className="h-4 w-4 opacity-50" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-white border border-gray-200 shadow-md">
                              <DropdownMenuItem
                                onClick={() =>
                                  setNewCollection({
                                    ...newCollection,
                                    visibility: "private",
                                  })
                                }
                              >
                                Private
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  setNewCollection({
                                    ...newCollection,
                                    visibility: "unlisted",
                                  })
                                }
                              >
                                Unlisted
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <p className="text-muted-foreground text-xs">
                            Collections need at least 3 artworks to be
                            published.
                          </p>
                        </div>
                        <MinimalButton
                          onClick={async () => {
                            if (!newCollection.name.trim()) {
                              toast.error("Collection name is required");
                              return;
                            }
                            try {
                              let coverImageUrl = newCollection.coverImage;
                              if (coverImageFile) {
                                setIsUploadingCover(true);
                                try {
                                  const presignedResponse =
                                    await getPresignedUrl({
                                      fileName: coverImageFile.name,
                                      contentType: coverImageFile.type,
                                    });
                                  if (
                                    !presignedResponse.success ||
                                    !presignedResponse.presignedUrl
                                  ) {
                                    throw new Error("Failed to get upload URL");
                                  }
                                  await uploadFileToS3(
                                    presignedResponse.presignedUrl,
                                    coverImageFile,
                                  );
                                  coverImageUrl = presignedResponse.publicUrl;
                                } finally {
                                  setIsUploadingCover(false);
                                }
                              }
                              await createCollection({
                                ...newCollection,
                                coverImage: coverImageUrl,
                              } as any);
                              setShowCreateCollection(false);
                              setNewCollection({
                                name: "",
                                description: "",
                                visibility: "private",
                                coverImage: "",
                              });
                              setCoverImageFile(null);
                              setCoverImagePreview("");
                              queryClient.invalidateQueries({
                                queryKey: collectionKeys.lists(),
                              });
                              toast.success("Collection created successfully");
                            } catch (error) {
                              // Handled by hook or catch block
                            }
                          }}
                          disabled={isCreating || isUploadingCover}
                          className="w-full bg-red-600 text-white hover:bg-red-700"
                        >
                          {isCreating || isUploadingCover
                            ? "Creating..."
                            : "Create Collection"}
                        </MinimalButton>
                      </div>
                    </div>
                  )}

                  {isLoadingCollections ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="aspect-[4/3] w-full animate-pulse rounded-lg bg-gray-100"
                        />
                      ))}
                    </div>
                  ) : collectionsData?.collections &&
                    collectionsData.collections.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {collectionsData.collections.map((collection) => (
                        <div
                          key={collection.id}
                          className="group relative overflow-hidden rounded-lg border border-gray-100 bg-white transition-all hover:shadow-md"
                        >
                          <Link
                            to={`/collections/${collection.id}`}
                            className="block"
                          >
                            <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
                              {collection.coverImage &&
                              !collectionImageErrors[collection.id] ? (
                                <img
                                  src={collection.coverImage}
                                  alt={collection.name}
                                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                  onError={() =>
                                    setCollectionImageErrors((prev) => ({
                                      ...prev,
                                      [collection.id]: true,
                                    }))
                                  }
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <FolderOpen className="h-12 w-12 text-gray-300" />
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                                  {collection.name}
                                </h3>
                                <span className="text-gray-500 text-xs">
                                  {collection.artworkCount || 0} Artworks
                                </span>
                              </div>
                              {collection.description && (
                                <p className="mt-1 line-clamp-1 text-gray-500 text-xs">
                                  {collection.description}
                                </p>
                              )}
                            </div>
                          </Link>

                          {!isViewingOtherProfile && (
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                              <Button
                                variant="secondary"
                                size="icon"
                                disabled={isPublishing || isUnpublishing}
                                className="h-8 w-8 bg-white/90 shadow-sm backdrop-blur-sm hover:bg-white"
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  try {
                                    if (collection.visibility === "public") {
                                      await unpublishCollection(collection.id);
                                      toast.success("Collection unpublished");
                                    } else {
                                      if ((collection.artworkCount || 0) < 3) {
                                        toast.error(
                                          "Add at least 3 artworks to publish",
                                        );
                                        return;
                                      }
                                      await publishCollection(collection.id);
                                      toast.success("Collection published");
                                    }
                                    queryClient.invalidateQueries({
                                      queryKey: collectionKeys.lists(),
                                    });
                                  } catch (error) {}
                                }}
                              >
                                {isPublishing || isUnpublishing ? (
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                                ) : collection.visibility === "public" ? (
                                  <EyeOff className="h-4 w-4 text-gray-600" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-600" />
                                )}
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8 bg-red-600/90 shadow-sm backdrop-blur-sm hover:bg-red-600"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setCollectionToDelete(collection.id);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-white" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
                        <FolderOpen className="h-10 w-10 text-gray-300" />
                      </div>
                      <h3 className="mb-1 font-medium text-gray-900">
                        No collections yet
                      </h3>
                      <p className="text-gray-500 text-sm">
                        Create your first collection to organize your favorite
                        artworks.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === "settings" && !isViewingOtherProfile && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-6 md:col-span-2">
                  <div className="rounded-md border border-gray-100 bg-white p-6">
                    <h2 className="mb-6 font-medium text-gray-900 text-lg">
                      Account Information
                    </h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                          <p className="text-gray-500 text-xs">Full Name</p>
                          <p className="font-medium">{profile.name}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500 text-xs">Email</p>
                          <p className="font-medium">
                            {profile.email || "N/A"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500 text-xs">Role</p>
                          <p className="font-medium capitalize">
                            {(profile as any).role}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500 text-xs">Member Since</p>
                          <p className="font-medium">
                            {profile.createdAt
                              ? new Date(profile.createdAt).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" asChild>
                        <Link to="/profile/edit">Edit Profile Credentials</Link>
                      </Button>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {searchParams.get("from") === "checkout" && (
                    <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 text-sm flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p>
                        You came here from checkout. Update your saved shipping address,
                        then return to continue your order.
                      </p>
                      <Button size="sm" className="bg-amber-700 hover:bg-amber-800 text-white shrink-0" asChild>
                        <Link to="/checkout">Return to checkout</Link>
                      </Button>
                    </div>
                  )}
                  <ShippingAddressForm profile={profile} />

                  {/* Preferences */}
                  <div className="rounded-md border border-gray-100 bg-white p-6">
                    <h2 className="mb-6 font-medium text-gray-900 text-lg">
                      Preferences
                    </h2>
                    <div className="space-y-4">
                      <div className="flex flex-col-reverse items-start gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-gray-500 text-sm">
                            Receive updates about your artworks and collections
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${(profile as any).emailSubscription ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                        >
                          {(profile as any).emailSubscription
                            ? "Enabled"
                            : "Disabled"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-md border border-gray-100 bg-white p-6">
                    <h3 className="mb-4 font-semibold text-gray-900">
                      Quick Actions
                    </h3>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        asChild
                      >
                        <Link to="/sellart">
                          <Palette className="mr-2 h-4 w-4" />
                          Add New Artwork
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        asChild
                      >
                        <Link to="/profile/my-artworks">
                          <Images className="mr-2 h-4 w-4" />
                          Manage My Artworks
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SHIPMENTS TAB */}
            {activeTab === "shipments" && !isViewingOtherProfile && (
              <ShipmentsTab />
            )}
          </div>
        </div>
      </div>

      {/* Delete Collection Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Collection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this collection? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCollectionToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!collectionToDelete) return;
                try {
                  await deleteCollection(collectionToDelete);
                  queryClient.invalidateQueries({
                    queryKey: collectionKeys.lists(),
                  });
                  setDeleteDialogOpen(false);
                  setCollectionToDelete(null);
                  toast.success("Collection deleted successfully");
                } catch (error) {
                  // Error handled by hook
                }
              }}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Blog Edit Sheet */}
      <BlogEditSheet
        blogPost={selectedBlogToEdit}
        isOpen={isEditSheetOpen}
        onClose={() => setIsEditSheetOpen(false)}
      />
    </ProtectedRoute>
  );
}
