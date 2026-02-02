import { ArtworkCard } from "@/components/artwork-card"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ProfileSkeleton } from "@/components/profile/profile-skeleton"
import { ProfileSectionSkeleton } from "@/components/skeletons/profile-section-skeleton"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MinimalButton } from "@/components/ui/minimal-button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/use-auth"
import { useMyArtworks } from "@/queries/artworkQueries"
import { useMyCollections } from "@/queries/collectionQueries"
import { useFollowing } from "@/queries/followQueries"
import { artworkKeys, collectionKeys, userKeys } from "@/queries/queryKeys"
import { useGetPresignedImageUploadUrl } from "@/queries/uploadQueries"
import { useMyProfile, useUser } from "@/queries/userQueries"
import { useDeleteArtwork } from "@/services/artwork/useDeleteArtwork"
import { useCreateCollection } from "@/services/collections/useCreateCollection"
import { useDeleteCollection } from "@/services/collections/useDeleteCollection"
import { usePublishCollection } from "@/services/collections/usePublishCollection"
import { useUnpublishCollection } from "@/services/collections/useUnpublishCollection"
import { uploadFileToS3 } from "@/services/upload"
import { useUpdateAvatar } from "@/services/users/useUpdateAvatar"
import { useUpdateProfile } from "@/services/users/useUpdateProfile"
import { getAvatarUrl } from "@/utils/avatar"
import { useQueryClient } from "@tanstack/react-query"
import {
    Award,
    BarChart3,
    Calendar,
    Circle,
    Clock,
    Edit,
    Eye,
    EyeOff,
    Flame,
    FolderOpen,
    FolderPlus,
    Globe,
    Image as ImageIcon,
    Languages,
    Mail,
    MapPin,
    Mountain,
    Plus,
    Trash2,
    Upload,
    User,
    X
} from "lucide-react"
import { Users } from "lucide-react"
import { Palette } from "lucide-react"
import { useRef, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

export default function ProfilePage() {
    const { user: sessionUser } = useAuth()
    const navigate = useNavigate()
    const { userId } = useParams<{ userId?: string }>()

    // If userId is provided and different from current user, fetch that user's profile
    // Otherwise, fetch current user's profile
    const isViewingOtherProfile = userId && userId !== sessionUser?.id
    const {
        data: otherUserData,
        isLoading: isLoadingOtherUser,
        error: otherUserError
    } = useUser(userId || "")
    const {
        data: myProfileData,
        isLoading: isLoadingMyProfile,
        error: myProfileError
    } = useMyProfile()

    // Use the appropriate data based on whether we're viewing another user's profile
    const profileData = isViewingOtherProfile ? otherUserData : myProfileData
    const isLoading = isViewingOtherProfile ? isLoadingOtherUser : isLoadingMyProfile
    const error = isViewingOtherProfile ? otherUserError : myProfileError
    const { data: collectionsData, isLoading: isLoadingCollections } = useMyCollections(1, 10)
    const { data: artworksData, isLoading: isLoadingArtworks } = useMyArtworks(1, 3)

    // Get profile ID for following query - use userId param or session user id
    const profileIdForFollowing = userId || sessionUser?.id
    // Fetch following users for avatars display
    const { data: followingData } = useFollowing(profileIdForFollowing, 1, 4)
    const followingUsers = followingData?.users || []
    const { createCollection, isCreating } = useCreateCollection()
    const { deleteCollection, isDeleting } = useDeleteCollection()
    const { publishCollection } = usePublishCollection()
    const { unpublishCollection } = useUnpublishCollection()
    const { deleteArtwork, isDeleting: isDeletingArtwork } = useDeleteArtwork()
    const { mutateAsync: getPresignedUrl } = useGetPresignedImageUploadUrl()
    const { updateProfile, isUpdating: isUpdatingProfile } = useUpdateProfile()
    const { updateAvatar, isUpdating: isUpdatingAvatar } = useUpdateAvatar()
    const queryClient = useQueryClient()
    const [showCreateCollection, setShowCreateCollection] = useState(false)

    // Profile cover image state
    const [profileCoverImageFile, setProfileCoverImageFile] = useState<File | null>(null)
    const [profileCoverImagePreview, setProfileCoverImagePreview] = useState<string>("")
    const [isUploadingProfileCover, setIsUploadingProfileCover] = useState(false)
    const profileCoverImageInputRef = useRef<HTMLInputElement>(null)

    // Profile avatar state
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string>("")
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
    const avatarInputRef = useRef<HTMLInputElement>(null)

    const handleDeleteArtwork = async (artworkId: string) => {
        if (window.confirm("Are you sure you want to delete this artwork?")) {
            try {
                await deleteArtwork(artworkId)
                queryClient.invalidateQueries({ queryKey: artworkKeys.myArtworks() })
                toast.success("Artwork deleted successfully")
            } catch (error: any) {
                toast.error(`Failed to delete artwork: ${error?.message || "An error occurred"}`)
            }
        }
    }
    const [newCollection, setNewCollection] = useState({
        name: "",
        description: "",
        visibility: "private",
        coverImage: ""
    })
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
    const [coverImagePreview, setCoverImagePreview] = useState<string>("")
    const [isUploadingCover, setIsUploadingCover] = useState(false)
    const coverImageInputRef = useRef<HTMLInputElement>(null)

    // Delete confirmation dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [collectionToDelete, setCollectionToDelete] = useState<string | null>(null)

    // Show loading only if we don't have any data at all
    if (isLoading && !profileData) {
        return <ProfileSkeleton />
    }

    // Only show error if we don't have cached data
    if (error && !profileData) {
        console.error("Profile error:", error)
        return (
            <div className="container mx-auto px-4 py-8">
                <EmptyState
                    icon={User}
                    title="Error Loading Profile"
                    description="Failed to load your profile. Please try again later."
                />
            </div>
        )
    }

    const profile = profileData?.profile || sessionUser

    // Debug: Log the profile data to see what we're getting
    console.log("Profile Data:", profileData)
    console.log("Profile Object:", profile)
    console.log("Profile Bio:", (profile as any)?.bio)
    console.log("Profile Heat Score:", (profile as any)?.heatScore)
    console.log("Profile Views:", (profile as any)?.profileViews)
    console.log("Profile Talent Types:", (profile as any)?.talentTypes)

    if (!profile) {
        return (
            <div className="container mx-auto px-4 py-8">
                <EmptyState
                    icon={User}
                    title="Profile Not Found"
                    description="We couldn't find your profile information."
                />
            </div>
        )
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                {/* Cover Image - Full Width Black Banner */}
                <div className="px-4">
                    <div
                        className={`relative h-48 w-full bg-black ${
                            !isViewingOtherProfile ? "group cursor-pointer" : ""
                        }`}
                        onClick={() => {
                            if (!isViewingOtherProfile) {
                                profileCoverImageInputRef.current?.click()
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
                            const file = e.target.files?.[0]
                            if (!file) return

                            // Validate file size (max 5MB)
                            if (file.size > 5 * 1024 * 1024) {
                                toast.error("Image size must be less than 5MB")
                                return
                            }

                            // Validate file type
                            if (!file.type.startsWith("image/")) {
                                toast.error("Please select an image file")
                                return
                            }

                            setProfileCoverImageFile(file)
                            setProfileCoverImagePreview(URL.createObjectURL(file))

                            // Upload and update profile immediately
                            setIsUploadingProfileCover(true)
                            try {
                                const presignedResponse = await getPresignedUrl({
                                    fileName: file.name,
                                    contentType: file.type
                                })

                                if (!presignedResponse.success || !presignedResponse.presignedUrl) {
                                    throw new Error("Failed to get upload URL")
                                }

                                await uploadFileToS3(presignedResponse.presignedUrl, file)
                                const coverImageUrl = presignedResponse.publicUrl

                                // Update profile with new cover image
                                await updateProfile({
                                    coverImage: coverImageUrl
                                })

                                // Invalidate profile queries to refresh the data
                                queryClient.invalidateQueries({ queryKey: userKeys.me() })
                                if (profile?.id) {
                                    queryClient.invalidateQueries({
                                        queryKey: userKeys.detail(profile.id)
                                    })
                                }

                                toast.success("Cover image updated successfully")

                                // Clear preview after successful upload
                                setProfileCoverImageFile(null)
                                setProfileCoverImagePreview("")
                            } catch (error: any) {
                                toast.error(
                                    `Failed to upload cover image: ${error?.message || "An error occurred"}`
                                )
                                // Reset preview on error
                                setProfileCoverImageFile(null)
                                setProfileCoverImagePreview("")
                            } finally {
                                setIsUploadingProfileCover(false)
                                // Reset file input
                                if (profileCoverImageInputRef.current) {
                                    profileCoverImageInputRef.current.value = ""
                                }
                            }
                        }}
                    />
                )}

                <div className="container mx-auto max-w-6xl px-4 py-8">
                    {/* Profile Header */}
                    <div className="mb-6">
                        <div className="flex items-start justify-between">
                            <div className="-mt-20 flex flex-1 items-center space-x-4">
                                <div
                                    className={`relative ${!isViewingOtherProfile ? "group cursor-pointer" : ""}`}
                                    onClick={() => {
                                        if (!isViewingOtherProfile) {
                                            avatarInputRef.current?.click()
                                        }
                                    }}
                                >
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt={profile.name || "User"}
                                            className="h-40 w-40 rounded-full border-[8px] object-cover"
                                            style={{ borderColor: "#F9FAFB" }}
                                        />
                                    ) : profile.image ? (
                                        <img
                                            src={profile.image}
                                            alt={profile.name || "User"}
                                            className="h-40 w-40 rounded-full border-[8px] object-cover"
                                            style={{ borderColor: "#F9FAFB" }}
                                        />
                                    ) : (
                                        <div
                                            className="flex h-40 w-40 items-center justify-center rounded-full border-[8px] bg-blue-600"
                                            style={{ borderColor: "#F9FAFB" }}
                                        >
                                            <span className="font-bold text-4xl text-white">
                                                {(profile.name || "U")[0].toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    {!isViewingOtherProfile && (
                                        <>
                                            {/* Red edit icon at bottom-right - cutting into avatar */}
                                            <div className="absolute right-1 bottom-1 z-10 flex h-12 w-12 items-center justify-center rounded-full border-[6px] border-white bg-red-700">
                                                <Edit className="h-4 w-4 text-white" />
                                            </div>
                                            {/* Hidden file input */}
                                            <Input
                                                ref={avatarInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0]
                                                    if (!file) return

                                                    // Validate file size (max 5MB)
                                                    if (file.size > 5 * 1024 * 1024) {
                                                        toast.error(
                                                            "Image size must be less than 5MB"
                                                        )
                                                        return
                                                    }

                                                    // Validate file type
                                                    if (!file.type.startsWith("image/")) {
                                                        toast.error("Please select an image file")
                                                        return
                                                    }

                                                    setAvatarFile(file)
                                                    setAvatarPreview(URL.createObjectURL(file))

                                                    // Upload and update avatar immediately
                                                    setIsUploadingAvatar(true)
                                                    try {
                                                        const presignedResponse =
                                                            await getPresignedUrl({
                                                                fileName: file.name,
                                                                contentType: file.type
                                                            })

                                                        if (
                                                            !presignedResponse.success ||
                                                            !presignedResponse.presignedUrl
                                                        ) {
                                                            throw new Error(
                                                                "Failed to get upload URL"
                                                            )
                                                        }

                                                        await uploadFileToS3(
                                                            presignedResponse.presignedUrl,
                                                            file
                                                        )
                                                        const avatarUrl =
                                                            presignedResponse.publicUrl

                                                        // Update avatar
                                                        await updateAvatar(avatarUrl)

                                                        // Invalidate profile queries to refresh the data
                                                        queryClient.invalidateQueries({
                                                            queryKey: userKeys.me()
                                                        })
                                                        if (profile?.id) {
                                                            queryClient.invalidateQueries({
                                                                queryKey: userKeys.detail(
                                                                    profile.id
                                                                )
                                                            })
                                                        }

                                                        toast.success(
                                                            "Profile picture updated successfully"
                                                        )

                                                        // Clear preview after successful upload
                                                        setAvatarFile(null)
                                                        setAvatarPreview("")
                                                    } catch (error: any) {
                                                        toast.error(
                                                            `Failed to upload profile picture: ${error?.message || "An error occurred"}`
                                                        )
                                                        // Reset preview on error
                                                        setAvatarFile(null)
                                                        setAvatarPreview("")
                                                    } finally {
                                                        setIsUploadingAvatar(false)
                                                        // Reset file input
                                                        if (avatarInputRef.current) {
                                                            avatarInputRef.current.value = ""
                                                        }
                                                    }
                                                }}
                                            />
                                        </>
                                    )}
                                </div>
                                <div className="mt-12 flex-1">
                                    <h1 className="mt-2 font-bold text-3xl text-gray-900">
                                        {profile.name || "User"}
                                    </h1>
                                    {/* Heat Score and Views */}
                                    <div className="mt-2 flex items-center gap-4 text-sm">
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
                                                {(
                                                    (profile as any)?.profileViews ?? 0
                                                ).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Inline Stats with Following Avatars */}
                                    <div className="mt-3 flex items-center gap-4">
                                        <Link
                                            to={`/profile/${profile.id}/followers`}
                                            className="text-gray-900 transition-colors hover:text-red-600"
                                        >
                                            <span className="font-semibold text-lg">
                                                {(profile as any).followerCount || 0}
                                            </span>
                                            <span className="ml-1 text-gray-600">Followers</span>
                                        </Link>
                                        <div className="h-4 w-px bg-gray-300" />
                                        <div className="flex items-center gap-2">
                                            <Link
                                                to={`/profile/${profile.id}/following`}
                                                className="text-gray-900 transition-colors hover:text-red-600"
                                            >
                                                <span className="font-semibold text-lg">
                                                    {(profile as any).followingCount || 0}
                                                </span>
                                                <span className="ml-1 text-gray-600">
                                                    Following
                                                </span>
                                            </Link>
                                            {/* Following Avatars - Overlapping */}
                                            {followingUsers.length > 0 && (
                                                <div className="-space-x-4 ml-2 flex items-center">
                                                    {followingUsers
                                                        .slice(0, 4)
                                                        .map((user, index) => (
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
                                                                        40
                                                                    )}
                                                                    alt={user.name || "User"}
                                                                    className="h-8 min-h-[2rem] w-8 min-w-[2rem] rounded-full border-2 border-white bg-gray-200 object-cover transition-transform hover:scale-110"
                                                                    onError={(e) => {
                                                                        const target =
                                                                            e.target as HTMLImageElement
                                                                        target.src = getAvatarUrl(
                                                                            null,
                                                                            user.name || "User",
                                                                            40
                                                                        )
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
                                        <span className="mt-2 inline-block rounded-full bg-red-100 px-3 py-1 font-medium text-red-700 text-xs">
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
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-6 md:col-span-2">
                            {/* Bio Section */}
                            {((profile as any)?.bio ||
                                (profile as any)?.location ||
                                (profile as any)?.website) && (
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
                                    {((profile as any)?.location || (profile as any)?.website) && (
                                        <div className="flex flex-wrap items-center gap-5 text-sm">
                                            {(profile as any)?.location && (
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <MapPin className="h-4 w-4 text-gray-500" />
                                                    <span className="font-medium">
                                                        {(profile as any).location}
                                                    </span>
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

                            {/* Engagement Metrics - Minimal inline design */}
                            {(profile as any)?.lastActiveAt &&
                                (() => {
                                    try {
                                        const lastActive = new Date((profile as any).lastActiveAt)
                                        const now = new Date()
                                        const diffMinutes =
                                            (now.getTime() - lastActive.getTime()) / (1000 * 60)
                                        const isOnline = diffMinutes < 5
                                        return isOnline ? (
                                            <div className="border-gray-100 border-b py-6">
                                                <div className="flex flex-wrap items-center gap-6 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Circle className="h-3 w-3 fill-green-500 text-green-500" />
                                                        <span className="text-gray-500">
                                                            Online
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null
                                    } catch (e) {
                                        return null
                                    }
                                })()}

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

                            {/* My Artworks */}
                            {isLoadingArtworks ? (
                                <ProfileSectionSkeleton />
                            ) : artworksData?.artworks && artworksData.artworks.length > 0 ? (
                                <>
                                    <div className="rounded-md border border-gray-100 bg-white p-6">
                                        <div className="mb-4 flex items-center justify-between">
                                            <h2 className="font-medium text-gray-900 text-lg">
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
                                        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                                            {artworksData.artworks.slice(0, 3).map((artwork) => (
                                                <div key={artwork.id} className="group relative">
                                                    <Link
                                                        to={`/artwork/${artwork.id}`}
                                                        className="block"
                                                    >
                                                        <ArtworkCard
                                                            id={artwork.id}
                                                            image={
                                                                artwork.photos?.[0] ||
                                                                "/placeholder.svg"
                                                            }
                                                            title={artwork.title || "Untitled"}
                                                            artist={artwork.artist || "Unknown"}
                                                            price={`$${
                                                                artwork.desiredPrice?.toLocaleString() ||
                                                                "0"
                                                            }`}
                                                            year={artwork.yearOfArtwork || "N/A"}
                                                            medium={artwork.support || "N/A"}
                                                            dimensions={
                                                                artwork.dimensions &&
                                                                typeof artwork.dimensions ===
                                                                    "object"
                                                                    ? `${artwork.dimensions.height || 0}x${
                                                                          artwork.dimensions
                                                                              .width || 0
                                                                      } cm`
                                                                    : "N/A"
                                                            }
                                                            seller={artwork.user?.name || "Unknown"}
                                                            status={artwork.status}
                                                        />
                                                    </Link>
                                                    {/* Edit and Delete Buttons */}
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
                                                            <Link
                                                                to={`/artwork/${artwork.id}/edit`}
                                                            >
                                                                <Edit className="h-3.5 w-3.5 text-gray-700" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            onClick={(e) => {
                                                                e.preventDefault()
                                                                e.stopPropagation()
                                                                handleDeleteArtwork(artwork.id)
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
                                                        {artworksData.total ||
                                                            artworksData.artworks.length}
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
                                <div className="rounded-md border border-gray-100 bg-white p-6">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h2 className="font-medium text-gray-900 text-lg">
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
                                <div className="rounded-md border border-gray-100 bg-white p-6">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h2 className="font-medium text-gray-900 text-lg">
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
                                    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                                            <Palette className="h-10 w-10 text-gray-400" />
                                        </div>
                                        <h3 className="mb-2 font-semibold text-gray-500 text-xl">
                                            No Artworks Yet
                                        </h3>
                                    </div>
                                </div>
                            )}

                            {/* My Collections */}
                            <div className="rounded-md border border-gray-100 bg-white p-6">
                                <div className="mb-4 flex items-center justify-between">
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
                                                            name: e.target.value
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
                                                            description: e.target.value
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
                                                                className="absolute top-2 right-2"
                                                                onClick={() => {
                                                                    setCoverImageFile(null)
                                                                    setCoverImagePreview("")
                                                                    setNewCollection({
                                                                        ...newCollection,
                                                                        coverImage: ""
                                                                    })
                                                                }}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className="cursor-pointer rounded-lg border-2 border-gray-300 border-dashed p-6 text-center transition-colors hover:border-gray-400"
                                                            onClick={() =>
                                                                coverImageInputRef.current?.click()
                                                            }
                                                        >
                                                            <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                                            <Label
                                                                htmlFor="coverImageInput"
                                                                className="cursor-pointer text-gray-600 text-sm hover:text-gray-900"
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
                                                                    const file = e.target.files?.[0]
                                                                    if (!file) return

                                                                    // Validate file size (max 5MB)
                                                                    if (
                                                                        file.size >
                                                                        5 * 1024 * 1024
                                                                    ) {
                                                                        toast.error(
                                                                            "Image size must be less than 5MB"
                                                                        )
                                                                        return
                                                                    }

                                                                    // Validate file type
                                                                    if (
                                                                        !file.type.startsWith(
                                                                            "image/"
                                                                        )
                                                                    ) {
                                                                        toast.error(
                                                                            "Please select an image file"
                                                                        )
                                                                        return
                                                                    }

                                                                    setCoverImageFile(file)
                                                                    setCoverImagePreview(
                                                                        URL.createObjectURL(file)
                                                                    )
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="collectionVisibility">
                                                    Visibility
                                                </Label>
                                                <Select
                                                    value={newCollection.visibility}
                                                    onValueChange={(
                                                        value: "private" | "unlisted"
                                                    ) =>
                                                        setNewCollection({
                                                            ...newCollection,
                                                            visibility: value
                                                        })
                                                    }
                                                >
                                                    <SelectTrigger id="collectionVisibility">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="private">
                                                            Private
                                                        </SelectItem>
                                                        <SelectItem value="unlisted">
                                                            Unlisted
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <p className="text-muted-foreground text-xs">
                                                    Collections need at least 3 artworks to be
                                                    published. Publish from the collection page once
                                                    you’ve added enough.
                                                </p>
                                            </div>
                                            <MinimalButton
                                                onClick={async () => {
                                                    if (!newCollection.name.trim()) {
                                                        toast.error("Collection name is required")
                                                        return
                                                    }
                                                    try {
                                                        let coverImageUrl = newCollection.coverImage

                                                        // Upload cover image if selected
                                                        if (coverImageFile) {
                                                            setIsUploadingCover(true)
                                                            try {
                                                                const presignedResponse =
                                                                    await getPresignedUrl({
                                                                        fileName:
                                                                            coverImageFile.name,
                                                                        contentType:
                                                                            coverImageFile.type
                                                                    })

                                                                if (
                                                                    !presignedResponse.success ||
                                                                    !presignedResponse.presignedUrl
                                                                ) {
                                                                    throw new Error(
                                                                        "Failed to get upload URL"
                                                                    )
                                                                }

                                                                await uploadFileToS3(
                                                                    presignedResponse.presignedUrl,
                                                                    coverImageFile
                                                                )

                                                                coverImageUrl =
                                                                    presignedResponse.publicUrl
                                                                toast.success(
                                                                    "Cover image uploaded successfully"
                                                                )
                                                            } catch (error: any) {
                                                                toast.error(
                                                                    `Failed to upload cover image: ${error?.message || "An error occurred"}`
                                                                )
                                                                setIsUploadingCover(false)
                                                                return
                                                            } finally {
                                                                setIsUploadingCover(false)
                                                            }
                                                        }

                                                        // Create collection with cover image URL
                                                        const response = await createCollection({
                                                            ...newCollection,
                                                            coverImage: coverImageUrl || undefined
                                                        })

                                                        // Reset form
                                                        setNewCollection({
                                                            name: "",
                                                            description: "",
                                                            visibility: "private",
                                                            coverImage: ""
                                                        })
                                                        setCoverImageFile(null)
                                                        setCoverImagePreview("")
                                                        setShowCreateCollection(false)

                                                        // Invalidate queries
                                                        queryClient.invalidateQueries({
                                                            queryKey: collectionKeys.lists()
                                                        })

                                                        // Navigate to collection detail page
                                                        if (response?.collection?.id) {
                                                            navigate(
                                                                `/collections/${response.collection.id}`
                                                            )
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
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
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
                                                            <div className="relative mb-4 aspect-[4/5] overflow-hidden bg-gray-100">
                                                                {collection.coverImage ? (
                                                                    <img
                                                                        src={collection.coverImage}
                                                                        alt={collection.name}
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-full w-full items-center justify-center bg-gray-200">
                                                                        <FolderOpen className="h-12 w-12 text-gray-400" />
                                                                    </div>
                                                                )}
                                                                {/* Visibility Badge Overlay */}
                                                                <div className="absolute top-3 right-3 z-10">
                                                                    <span
                                                                        className={`rounded-full px-2 py-1 font-medium text-xs backdrop-blur-sm ${
                                                                            collection.visibility ===
                                                                            "public"
                                                                                ? "bg-green-500/90 text-white"
                                                                                : collection.visibility ===
                                                                                    "unlisted"
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
                                                                <h3 className="line-clamp-1 font-semibold text-black text-sm uppercase tracking-wide">
                                                                    {collection.name}
                                                                </h3>
                                                                <div className="flex items-center gap-2 text-gray-500 text-xs">
                                                                    <ImageIcon className="h-3 w-3" />
                                                                    <span>
                                                                        {"artworkCount" in
                                                                            collection &&
                                                                        collection.artworkCount !==
                                                                            undefined
                                                                            ? collection.artworkCount
                                                                            : 0}{" "}
                                                                        {("artworkCount" in
                                                                            collection &&
                                                                        collection.artworkCount !==
                                                                            undefined
                                                                            ? collection.artworkCount
                                                                            : 0) === 1
                                                                            ? "artwork"
                                                                            : "artworks"}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Action Buttons */}
                                                            <div className="mt-3 flex items-center gap-2 border-gray-100 border-t pt-3">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    title={
                                                                        collection.visibility !==
                                                                            "public" &&
                                                                        (collection.artworkCount ??
                                                                            0) < 3
                                                                            ? "Add at least 3 artworks to publish"
                                                                            : undefined
                                                                    }
                                                                    disabled={
                                                                        collection.visibility !==
                                                                            "public" &&
                                                                        (collection.artworkCount ??
                                                                            0) < 3
                                                                    }
                                                                    onClick={async (e) => {
                                                                        e.preventDefault()
                                                                        e.stopPropagation()
                                                                        try {
                                                                            if (
                                                                                collection.visibility ===
                                                                                "public"
                                                                            ) {
                                                                                await unpublishCollection(
                                                                                    collection.id
                                                                                )
                                                                            } else {
                                                                                const count =
                                                                                    collection.artworkCount ??
                                                                                    0
                                                                                if (count < 3) {
                                                                                    toast.error(
                                                                                        `Collection must have at least 3 artworks to be published. Currently has ${count}.`
                                                                                    )
                                                                                    return
                                                                                }
                                                                                await publishCollection(
                                                                                    collection.id
                                                                                )
                                                                            }
                                                                            queryClient.invalidateQueries(
                                                                                {
                                                                                    queryKey:
                                                                                        collectionKeys.lists()
                                                                                }
                                                                            )
                                                                        } catch (error) {
                                                                            // Error handled by hook
                                                                        }
                                                                    }}
                                                                    className="flex-1"
                                                                >
                                                                    {collection.visibility ===
                                                                    "public" ? (
                                                                        <>
                                                                            <EyeOff className="mr-1 h-3 w-3" />
                                                                            Unpublish
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Eye className="mr-1 h-3 w-3" />
                                                                            Publish
                                                                        </>
                                                                    )}
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.preventDefault()
                                                                        e.stopPropagation()
                                                                        setCollectionToDelete(
                                                                            collection.id
                                                                        )
                                                                        setDeleteDialogOpen(true)
                                                                    }}
                                                                    disabled={isDeleting}
                                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
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
                                    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                                            <FolderOpen className="h-10 w-10 text-gray-400" />
                                        </div>
                                        <h3 className="mb-2 font-semibold text-gray-500 text-xl">
                                            No Collections Yet
                                        </h3>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Quick Actions */}
                            <div className="rounded-md border border-gray-100 bg-white p-6">
                                <div className="space-y-3">
                                    <Link
                                        to="/sellart"
                                        className="group flex items-center gap-3 text-gray-600 text-sm transition-colors hover:text-gray-900 hover:underline"
                                    >
                                        <ImageIcon className="h-4 w-4 text-gray-400 transition-colors group-hover:text-red-600" />
                                        <span>Sell Artwork</span>
                                    </Link>
                                    <Link
                                        to="/profile/my-artworks"
                                        className="group flex items-center gap-3 text-gray-600 text-sm transition-colors hover:text-gray-900 hover:underline"
                                    >
                                        <Palette className="h-4 w-4 text-gray-400 transition-colors group-hover:text-red-600" />
                                        <span>My Artworks</span>
                                    </Link>
                                </div>
                            </div>

                            {/* Account Information */}
                            <div className="rounded-md border border-gray-100 bg-white p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="font-medium text-gray-900 text-lg">
                                        Information and Contacts
                                    </h2>
                                    {!isViewingOtherProfile && (
                                        <button
                                            onClick={() => navigate("/profile/edit")}
                                            className="rounded-md p-1.5 transition-colors hover:bg-gray-100"
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
                                            <p className="text-gray-500 text-xs">Email</p>
                                            <p className="font-medium text-gray-900 text-sm">
                                                {profile.email}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Location */}
                                    {(profile as any)?.location && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-gray-400" />
                                            <div>
                                                <p className="text-gray-500 text-xs">Location</p>
                                                <p className="font-medium text-gray-900 text-sm">
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
                                                <p className="text-gray-500 text-xs">Website</p>
                                                <a
                                                    href={(profile as any).website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-medium text-gray-900 text-sm transition-colors hover:text-red-600"
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
                                                <p className="text-gray-500 text-xs">
                                                    Member Since
                                                </p>
                                                <p className="font-medium text-gray-900 text-sm">
                                                    {new Date(profile.createdAt).toLocaleDateString(
                                                        "en-GB",
                                                        {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric"
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
                                                    <p className="text-gray-500 text-xs">
                                                        Artworks
                                                    </p>
                                                    <p className="font-medium text-gray-900 text-sm">
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

                            {/* Account Stats */}
                            <div className="rounded-md border border-gray-100 bg-white p-6">
                                <div className="flex flex-wrap gap-3">
                                    {"artworkCount" in profile &&
                                        profile.artworkCount !== undefined && (
                                            <div className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2">
                                                <Palette className="h-3.5 w-3.5 text-gray-500" />
                                                <span className="text-gray-500 text-xs">
                                                    Artworks
                                                </span>
                                                <span className="font-semibold text-gray-900 text-sm">
                                                    {profile.artworkCount}
                                                </span>
                                            </div>
                                        )}
                                    {"collectionCount" in profile &&
                                        (profile as any).collectionCount !== undefined && (
                                            <div className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2">
                                                <FolderOpen className="h-3.5 w-3.5 text-gray-500" />
                                                <span className="text-gray-500 text-xs">
                                                    Collections
                                                </span>
                                                <span className="font-semibold text-gray-900 text-sm">
                                                    {(profile as any).collectionCount}
                                                </span>
                                            </div>
                                        )}
                                    {((profile as any).followerCount !== undefined ||
                                        (profile as any).followingCount !== undefined) && (
                                        <>
                                            <Link
                                                to={`/profile/${profile.id}/followers`}
                                                className="group flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2 transition-colors hover:bg-gray-100"
                                            >
                                                <Users className="h-3.5 w-3.5 text-gray-500 transition-colors group-hover:text-red-600" />
                                                <span className="text-gray-500 text-xs">
                                                    Followers
                                                </span>
                                                <span className="font-semibold text-gray-900 text-sm transition-colors group-hover:text-red-600">
                                                    {(profile as any).followerCount || 0}
                                                </span>
                                            </Link>
                                            <Link
                                                to={`/profile/${profile.id}/following`}
                                                className="group flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2 transition-colors hover:bg-gray-100"
                                            >
                                                <Users className="h-3.5 w-3.5 text-gray-500 transition-colors group-hover:text-red-600" />
                                                <span className="text-gray-500 text-xs">
                                                    Following
                                                </span>
                                                <span className="font-semibold text-gray-900 text-sm transition-colors group-hover:text-red-600">
                                                    {(profile as any).followingCount || 0}
                                                </span>
                                            </Link>
                                        </>
                                    )}
                                    {"reviewCount" in profile &&
                                        (profile as any).reviewCount !== undefined && (
                                            <div className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2">
                                                <Award className="h-3.5 w-3.5 text-gray-500" />
                                                <span className="text-gray-500 text-xs">
                                                    Reviews
                                                </span>
                                                <span className="font-semibold text-gray-900 text-sm">
                                                    {(profile as any).reviewCount}
                                                </span>
                                            </div>
                                        )}
                                    {"score" in profile && profile.score !== undefined && (
                                        <div className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2">
                                            <BarChart3 className="h-3.5 w-3.5 text-gray-500" />
                                            <span className="text-gray-500 text-xs">Score</span>
                                            <span className="font-semibold text-gray-900 text-sm">
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
                                <div className="rounded-md border border-gray-100 bg-white p-6">
                                    <h2 className="mb-4 font-medium text-gray-900 text-lg">
                                        Preferences
                                    </h2>
                                    <div className="space-y-3">
                                        {(profile as any)?.timezone && (
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <p className="text-gray-500 text-xs">
                                                        Timezone
                                                    </p>
                                                    <p className="font-medium text-gray-900 text-sm">
                                                        {(profile as any).timezone}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        {(profile as any)?.languagePreference && (
                                            <div className="flex items-center gap-2">
                                                <Languages className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <p className="text-gray-500 text-xs">
                                                        Language
                                                    </p>
                                                    <p className="font-medium text-gray-900 text-sm">
                                                        {(
                                                            (profile as any).languagePreference ||
                                                            "en"
                                                        ).toUpperCase()}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        {(profile as any)?.emailSubscription !== undefined && (
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <p className="text-gray-500 text-xs">
                                                        Email Subscriptions
                                                    </p>
                                                    <p className="font-medium text-gray-900 text-sm">
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
                            Are you sure you want to delete this collection? This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setCollectionToDelete(null)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async () => {
                                if (!collectionToDelete) return
                                try {
                                    await deleteCollection(collectionToDelete)
                                    queryClient.invalidateQueries({
                                        queryKey: collectionKeys.lists()
                                    })
                                    setDeleteDialogOpen(false)
                                    setCollectionToDelete(null)
                                    toast.success("Collection deleted successfully")
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
        </ProtectedRoute>
    )
}
