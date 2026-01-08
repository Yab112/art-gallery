import { useMyProfile, useUser } from "@/queries/userQueries";
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
  MapPin,
  Globe,
  Flame,
  Circle,
  Award,
  Clock,
  Languages,
  BarChart3,
  Mountain,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Users } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Palette } from "lucide-react";
import { useMyCollections } from "@/queries/collectionQueries";
import { useMyArtworks } from "@/queries/artworkQueries";
import { ArtworkCard } from "@/components/artwork-card";
import { useFollowing } from "@/queries/followQueries";
import { getAvatarUrl } from "@/utils/avatar";
import { useCreateCollection } from "@/services/collections/useCreateCollection";
import { useDeleteCollection } from "@/services/collections/useDeleteCollection";
import { usePublishCollection } from "@/services/collections/usePublishCollection";
import { useUnpublishCollection } from "@/services/collections/useUnpublishCollection";
import { useDeleteArtwork } from "@/services/artwork/useDeleteArtwork";
import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { collectionKeys, artworkKeys, userKeys } from "@/queries/queryKeys";
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
import { useUpdateProfile } from "@/services/users/useUpdateProfile";
import { useUpdateAvatar } from "@/services/users/useUpdateAvatar";
import { MinimalButton } from "@/components/ui/minimal-button";
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

export default function ProfilePage() {
  const { user: sessionUser } = useAuth();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId?: string }>();
  
  // If userId is provided and different from current user, fetch that user's profile
  // Otherwise, fetch current user's profile
  const isViewingOtherProfile = userId && userId !== sessionUser?.id;
  const { data: otherUserData, isLoading: isLoadingOtherUser, error: otherUserError } = useUser(userId || "");
  const { data: myProfileData, isLoading: isLoadingMyProfile, error: myProfileError } = useMyProfile();
  
  // Use the appropriate data based on whether we're viewing another user's profile
  const profileData = isViewingOtherProfile ? otherUserData : myProfileData;
  const isLoading = isViewingOtherProfile ? isLoadingOtherUser : isLoadingMyProfile;
  const error = isViewingOtherProfile ? otherUserError : myProfileError;
  const { data: collectionsData, isLoading: isLoadingCollections } =
    useMyCollections(1, 10);
  const { data: artworksData, isLoading: isLoadingArtworks } = useMyArtworks(
    1,
    3
  );
  
  // Get profile ID for following query - use userId param or session user id
  const profileIdForFollowing = userId || sessionUser?.id;
  // Fetch following users for avatars display
  const { data: followingData } = useFollowing(profileIdForFollowing, 1, 4);
  const followingUsers = followingData?.users || [];
  const { createCollection, isCreating } = useCreateCollection();
  const { deleteCollection, isDeleting } = useDeleteCollection();
  const { publishCollection } = usePublishCollection();
  const { unpublishCollection } = useUnpublishCollection();
  const { deleteArtwork, isDeleting: isDeletingArtwork } = useDeleteArtwork();
  const { mutateAsync: getPresignedUrl } = useGetPresignedImageUploadUrl();
  const { updateProfile, isUpdating: isUpdatingProfile } = useUpdateProfile();
  const { updateAvatar, isUpdating: isUpdatingAvatar } = useUpdateAvatar();
  const queryClient = useQueryClient();
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  
  // Profile cover image state
  const [profileCoverImageFile, setProfileCoverImageFile] = useState<File | null>(null);
  const [profileCoverImagePreview, setProfileCoverImagePreview] = useState<string>("");
  const [isUploadingProfileCover, setIsUploadingProfileCover] = useState(false);
  const profileCoverImageInputRef = useRef<HTMLInputElement>(null);
  
  // Profile avatar state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleDeleteArtwork = async (artworkId: string) => {
    if (window.confirm("Are you sure you want to delete this artwork?")) {
      try {
        await deleteArtwork(artworkId);
        queryClient.invalidateQueries({ queryKey: artworkKeys.myArtworks() });
        toast.success("Artwork deleted successfully");
      } catch (error: any) {
        toast.error(
          "Failed to delete artwork: " + (error?.message || "An error occurred")
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
    null
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
      <div className="min-h-screen bg-gray-50">
        {/* Cover Image - Full Width Black Banner */}
        <div className="px-4">
          <div 
            className={`relative w-full h-48 bg-black ${
              !isViewingOtherProfile ? "cursor-pointer group" : ""
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
              className="w-full h-full object-cover"
            />
          ) : (profile as any).coverImage ? (
            <img
              src={(profile as any).coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="bg-gray-600 rounded-lg p-4 inline-block">
                  <Mountain className="h-12 w-12 text-gray-300 mx-auto" />
                </div>
              </div>
            </div>
          )}
          {!isViewingOtherProfile && (
            <>
              {/* Full overlay with edit icon */}
              <div className="absolute top-0 bottom-0 left-0 right-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all pointer-events-none flex items-center justify-center">
                <Edit className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
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

                if (!presignedResponse.success || !presignedResponse.presignedUrl) {
                  throw new Error("Failed to get upload URL");
                }

                await uploadFileToS3(presignedResponse.presignedUrl, file);
                const coverImageUrl = presignedResponse.publicUrl;

                // Update profile with new cover image
                await updateProfile({
                  coverImage: coverImageUrl,
                });

                // Invalidate profile queries to refresh the data
                queryClient.invalidateQueries({ queryKey: userKeys.me() });
                if (profile?.id) {
                  queryClient.invalidateQueries({ queryKey: userKeys.detail(profile.id) });
                }

                toast.success("Cover image updated successfully");
                
                // Clear preview after successful upload
                setProfileCoverImageFile(null);
                setProfileCoverImagePreview("");
              } catch (error: any) {
                toast.error(
                  "Failed to upload cover image: " +
                    (error?.message || "An error occurred")
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
        
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Profile Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4 -mt-20 flex-1">
                  <div 
                    className={`relative ${!isViewingOtherProfile ? "cursor-pointer group" : ""}`}
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
                        className="w-40 h-40 rounded-full object-cover border-[8px]"
                        style={{ borderColor: '#F9FAFB' }}
                      />
                    ) : profile.image ? (
                      <img
                        src={profile.image}
                        alt={profile.name || "User"}
                        className="w-40 h-40 rounded-full object-cover border-[8px]"
                        style={{ borderColor: '#F9FAFB' }}
                      />
                    ) : (
                      <div className="w-40 h-40 bg-blue-600 rounded-full flex items-center justify-center border-[8px]"
                        style={{ borderColor: '#F9FAFB' }}>
                        <span className="text-4xl font-bold text-white">
                          {(profile.name || "U")[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    {!isViewingOtherProfile && (
                      <>
                        {/* Red edit icon at bottom-right - cutting into avatar */}
                        <div className="absolute bottom-1 right-1 w-12 h-12 bg-red-700 rounded-full flex items-center justify-center border-[6px] border-white z-10">
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

                              if (!presignedResponse.success || !presignedResponse.presignedUrl) {
                                throw new Error("Failed to get upload URL");
                              }

                              await uploadFileToS3(presignedResponse.presignedUrl, file);
                              const avatarUrl = presignedResponse.publicUrl;

                              // Update avatar
                              await updateAvatar(avatarUrl);

                              // Invalidate profile queries to refresh the data
                              queryClient.invalidateQueries({ queryKey: userKeys.me() });
                              if (profile?.id) {
                                queryClient.invalidateQueries({ queryKey: userKeys.detail(profile.id) });
                              }

                              toast.success("Profile picture updated successfully");
                              
                              // Clear preview after successful upload
                              setAvatarFile(null);
                              setAvatarPreview("");
                            } catch (error: any) {
                              toast.error(
                                "Failed to upload profile picture: " +
                                  (error?.message || "An error occurred")
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
                  <div className="mt-12 flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mt-2">
                      {profile.name || "User"}
                    </h1>
                    {/* Heat Score and Views */}
                    <div className="flex items-center gap-4 mt-2 text-sm">
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
                    <div className="flex items-center gap-4 mt-3">
                      <Link
                        to={`/profile/${profile.id}/followers`}
                        className="text-gray-900 hover:text-red-600 transition-colors"
                      >
                        <span className="text-lg font-semibold">
                          {(profile as any).followerCount || 0}
                        </span>
                        <span className="text-gray-600 ml-1">Followers</span>
                      </Link>
                      <div className="h-4 w-px bg-gray-300"></div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/profile/${profile.id}/following`}
                          className="text-gray-900 hover:text-red-600 transition-colors"
                        >
                          <span className="text-lg font-semibold">
                            {(profile as any).followingCount || 0}
                          </span>
                          <span className="text-gray-600 ml-1">Following</span>
                        </Link>
                        {/* Following Avatars - Overlapping */}
                        {followingUsers.length > 0 && (
                          <div className="flex items-center -space-x-4 ml-2">
                            {followingUsers.slice(0, 4).map((user, index) => (
                              <Link
                                key={user.id}
                                to={`/profile/${user.id}`}
                                className="relative block flex-shrink-0"
                                style={{ zIndex: 4 - index }}
                              >
                                <img
                                  src={getAvatarUrl(user.image, user.name || "User", 40)}
                                  alt={user.name || "User"}
                                  className="w-8 h-8 min-w-[2rem] min-h-[2rem] rounded-full border-2 border-white object-cover hover:scale-110 transition-transform bg-gray-200"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = getAvatarUrl(null, user.name || "User", 40);
                                  }}
                                  loading="lazy"
                                />
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {"role" in profile && profile.role && (
                      <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                        {profile.role}
                      </span>
                    )}
                  </div>
                </div>
                {!isViewingOtherProfile && (
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
                )}
              </div>
            </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Bio Section */}
              {((profile as any)?.bio ||
                (profile as any)?.location ||
                (profile as any)?.website) && (
                <div className="space-y-4">
                  {(profile as any)?.bio && (
                    <div className="bg-red-50/30 rounded-lg p-5 border border-red-100/50">
                      <h3 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                        About
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-sm">
                        {(profile as any).bio}
                      </p>
                    </div>
                  )}
                  {((profile as any)?.location || (profile as any)?.website) && (
                    <div className="flex flex-wrap items-center gap-5 text-sm">
                      {(profile as any)?.location && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{(profile as any).location}</span>
                        </div>
                      )}
                      {(profile as any)?.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-gray-500" />
                          <a
                            href={(profile as any).website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-600 hover:text-red-700 font-medium hover:underline transition-colors"
                          >
                            {(profile as any).website}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Engagement Metrics - Minimal inline design */}
              {(profile as any)?.lastActiveAt &&
                (() => {
                  try {
                    const lastActive = new Date(
                      (profile as any).lastActiveAt
                    );
                    const now = new Date();
                    const diffMinutes =
                      (now.getTime() - lastActive.getTime()) / (1000 * 60);
                    const isOnline = diffMinutes < 5;
                    return isOnline ? (
                      <div className="py-6 border-b border-gray-100">
                        <div className="flex flex-wrap items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Circle className="h-3 w-3 text-green-500 fill-green-500" />
                            <span className="text-gray-500">Online</span>
                          </div>
                        </div>
                      </div>
                    ) : null;
                  } catch (e) {
                    return null;
                  }
                })()}

              {/* Talent Types */}
              {(profile as any)?.talentTypes &&
                Array.isArray((profile as any).talentTypes) &&
                (profile as any).talentTypes.length > 0 && (
                  <div className="bg-white rounded-md p-6 border border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="h-4 w-4 text-gray-400" />
                      <h2 className="text-lg font-medium text-gray-900">
                        Talent Types
                      </h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(profile as any).talentTypes.map((tt: any) => (
                        <span
                          key={tt.id}
                          className="px-2.5 py-1 text-gray-600 border border-gray-200 rounded-md text-sm hover:border-gray-300 transition-colors"
                        >
                          {tt.icon && <span className="mr-1">{tt.icon}</span>}
                          {tt.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* My Artworks */}
              {isLoadingArtworks ? (
                <ProfileSectionSkeleton />
              ) : artworksData?.artworks && artworksData.artworks.length > 0 ? (
                <>
                  <div className="bg-white rounded-md p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-medium text-gray-900">
                        My Artworks
                      </h2>
                      <MinimalButton
                        icon={Plus}
                        onClick={() => navigate("/sellart")}
                        variant="default"
                      >
                        Add New Artwork
                      </MinimalButton>
                    </div>
                    {/* Artworks Preview Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      {artworksData.artworks.slice(0, 3).map((artwork) => (
                        <div key={artwork.id} className="relative group">
                          <Link to={`/artwork/${artwork.id}`} className="block">
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
                              status={artwork.status}
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
                <div className="bg-white rounded-md p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900">
                      My Artworks
                    </h2>
                    <MinimalButton
                      icon={Plus}
                      onClick={() => navigate("/sellart")}
                      variant="default"
                    >
                      Add New Artwork
                    </MinimalButton>
                  </div>
                  <Button variant="link" className="mt-4" asChild>
                    <Link to="/profile/my-artworks">View All My Artworks</Link>
                  </Button>
                </div>
              ) : (
                <div className="bg-white rounded-md p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900">
                      My Artworks
                    </h2>
                    <MinimalButton
                      icon={Plus}
                      onClick={() => navigate("/sellart")}
                      variant="default"
                    >
                      Create Artwork
                    </MinimalButton>
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
              <div className="bg-white rounded-md p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <FolderOpen className="h-4 w-4 text-gray-400" />
                    <h2 className="text-lg font-medium text-gray-900">
                      My Collections
                    </h2>
                  </div>
                  {showCreateCollection ? (
                    <button
                      onClick={() => setShowCreateCollection(false)}
                      className="text-sm text-gray-600 hover:text-gray-900 hover:underline transition-colors"
                    >
                      Cancel
                    </button>
                  ) : (
                    <MinimalButton
                      icon={FolderPlus}
                      onClick={() => setShowCreateCollection(true)}
                      variant="default"
                    >
                      New Collection
                    </MinimalButton>
                  )}
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
                              onClick={() =>
                                coverImageInputRef.current?.click()
                              }
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
                      <MinimalButton
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
                        isLoading={isCreating || isUploadingCover}
                        variant="default"
                      >
                        {isUploadingCover
                          ? "Uploading cover..."
                          : isCreating
                          ? "Creating..."
                          : "Create Collection"}
                      </MinimalButton>
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
                                      if (collection.visibility === "public") {
                                        await unpublishCollection(
                                          collection.id
                                        );
                                      } else {
                                        await publishCollection(collection.id);
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
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setCollectionToDelete(collection.id);
                                    setDeleteDialogOpen(true);
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
              <div className="bg-white rounded-md p-6 border border-gray-100">
                <div className="space-y-3">
                  <Link
                    to="/sellart"
                    className="flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900 hover:underline transition-colors group"
                  >
                    <ImageIcon className="h-4 w-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                    <span>Sell Artwork</span>
                  </Link>
                  <Link
                    to="/profile/my-artworks"
                    className="flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900 hover:underline transition-colors group"
                  >
                    <Palette className="h-4 w-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                    <span>My Artworks</span>
                  </Link>
                </div>
              </div>

              {/* Account Information */}
              <div className="bg-white rounded-md p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900">
                    Information and Contacts
                  </h2>
                  {!isViewingOtherProfile && (
                    <button
                      onClick={() => navigate("/profile/edit")}
                      className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <Edit className="h-4 w-4 text-gray-500" />
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {/* Email */}
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">
                        {profile.email}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  {(profile as any)?.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="text-sm font-medium text-gray-900">
                          {(profile as any).location}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Website */}
                  {(profile as any)?.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Website</p>
                        <a
                          href={(profile as any).website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-gray-900 hover:text-red-600 transition-colors"
                        >
                          {(profile as any).website}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Member Since */}
                  {profile.createdAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Member Since</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(profile.createdAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Artworks */}
                  {"artworkCount" in profile &&
                    profile.artworkCount !== undefined && (
                      <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Artworks</p>
                          <p className="text-sm font-medium text-gray-900">
                            {profile.artworkCount}{" "}
                            {profile.artworkCount === 1 ? "artwork" : "artworks"}
                          </p>
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Account Stats */}
              <div className="bg-white rounded-md p-6 border border-gray-100">
                <div className="flex flex-wrap gap-3">
                  {"artworkCount" in profile &&
                    profile.artworkCount !== undefined && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md">
                        <Palette className="h-3.5 w-3.5 text-gray-500" />
                        <span className="text-xs text-gray-500">Artworks</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {profile.artworkCount}
                        </span>
                      </div>
                    )}
                  {"collectionCount" in profile &&
                    (profile as any).collectionCount !== undefined && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md">
                        <FolderOpen className="h-3.5 w-3.5 text-gray-500" />
                        <span className="text-xs text-gray-500">Collections</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {(profile as any).collectionCount}
                        </span>
                      </div>
                    )}
                  {((profile as any).followerCount !== undefined ||
                    (profile as any).followingCount !== undefined) && (
                    <>
                      <Link
                        to={`/profile/${profile.id}/followers`}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors group"
                      >
                        <Users className="h-3.5 w-3.5 text-gray-500 group-hover:text-red-600 transition-colors" />
                        <span className="text-xs text-gray-500">Followers</span>
                        <span className="text-sm font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                          {(profile as any).followerCount || 0}
                        </span>
                      </Link>
                      <Link
                        to={`/profile/${profile.id}/following`}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors group"
                      >
                        <Users className="h-3.5 w-3.5 text-gray-500 group-hover:text-red-600 transition-colors" />
                        <span className="text-xs text-gray-500">Following</span>
                        <span className="text-sm font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                          {(profile as any).followingCount || 0}
                        </span>
                      </Link>
                    </>
                  )}
                  {"reviewCount" in profile &&
                    (profile as any).reviewCount !== undefined && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md">
                        <Award className="h-3.5 w-3.5 text-gray-500" />
                        <span className="text-xs text-gray-500">Reviews</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {(profile as any).reviewCount}
                        </span>
                      </div>
                    )}
                  {"score" in profile && profile.score !== undefined && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md">
                      <BarChart3 className="h-3.5 w-3.5 text-gray-500" />
                      <span className="text-xs text-gray-500">Score</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {profile.score || 0}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Preferences Info */}
              {((profile as any)?.timezone ||
                (profile as any)?.languagePreference ||
                (profile as any)?.emailSubscription !== undefined) && (
                <div className="bg-white rounded-md p-6 border border-gray-100">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Preferences
                  </h2>
                  <div className="space-y-3">
                    {(profile as any)?.timezone && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Timezone</p>
                          <p className="text-sm font-medium text-gray-900">
                            {(profile as any).timezone}
                          </p>
                        </div>
                      </div>
                    )}
                    {(profile as any)?.languagePreference && (
                      <div className="flex items-center gap-2">
                        <Languages className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Language</p>
                          <p className="text-sm font-medium text-gray-900">
                            {(
                              (profile as any).languagePreference || "en"
                            ).toUpperCase()}
                          </p>
                        </div>
                      </div>
                    )}
                    {(profile as any)?.emailSubscription !== undefined && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">
                            Email Subscriptions
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {(profile as any).emailSubscription
                              ? "Enabled"
                              : "Disabled"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
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
