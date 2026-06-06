import { ArtworkCard } from "@/components/artwork-card"
import { CollectionDetailSkeleton } from "@/components/skeletons/collection-detail-skeleton"
import { CollectionDescription } from "@/components/collections/collection-description"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/use-auth"
import { mapArtworkToCardProps } from "@/lib/utils/artwork-mapper"
import { useCollection } from "@/queries/collectionQueries"
import { collectionKeys } from "@/queries/queryKeys"
import { useCollectionSettings } from "@/queries/settingsQueries"
import { useGetPresignedImageUploadUrl } from "@/queries/uploadQueries"
import { useDeleteCollection } from "@/services/collections/useDeleteCollection"
import { usePublishCollection } from "@/services/collections/usePublishCollection"
import { useRemoveArtworkFromCollection } from "@/services/collections/useRemoveArtworkFromCollection"
import { useUnpublishCollection } from "@/services/collections/useUnpublishCollection"
import { useUpdateCollection } from "@/services/collections/useUpdateCollection"
import { uploadFileToS3 } from "@/services/upload"
import { useQueryClient } from "@tanstack/react-query"
import {
    ArrowLeft,
    Edit2,
    FolderOpen,
    Image as ImageIcon,
    Loader2,
    Plus,
    Share2,
    Trash2,
    X,
    Upload,
    ChevronDown,
    Globe,
    Lock,
    EyeOff
} from "lucide-react"
import { useEffect, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

export default function CollectionDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useAuth()
    const { data, isLoading, error } = useCollection(id || "")
    const { removeArtwork: removeArtworkFromCollection } = useRemoveArtworkFromCollection()
    const { publishCollection, isPublishing } = usePublishCollection()
    const { unpublishCollection, isUnpublishing } = useUnpublishCollection()
    const { updateCollection, isUpdating } = useUpdateCollection()
    const { deleteCollection } = useDeleteCollection()
    const { data: collectionSettings } = useCollectionSettings()
    const minArtworksForPublish = collectionSettings?.settings?.minArtworksForPublish || 3
    const { mutateAsync: getPresignedUrl } = useGetPresignedImageUploadUrl()
    const queryClient = useQueryClient()

    const collection = data?.collection
    const isOwner = collection?.createdBy === user?.id
    const isGuest = !user
    const backHref = (location.state as { from?: string } | null)?.from ?? "/collections"

    // Edit modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editForm, setEditForm] = useState({
        name: "",
        description: "",
        visibility: "private" as "public" | "private" | "unlisted",
        coverImage: ""
    })
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
    const [coverImagePreview, setCoverImagePreview] = useState("")
    const [isUploadingCover, setIsUploadingCover] = useState(false)

    // Delete and remove confirmation dialogs
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [removeArtworkDialogOpen, setRemoveArtworkDialogOpen] = useState(false)
    const [artworkToRemove, setArtworkToRemove] = useState<string | null>(null)
    const [imageError, setImageError] = useState(false)

    // Add artwork - navigate to artworks page with collection ID
    const handleAddArtwork = () => {
        if (id) {
            navigate(`/buyart?addToCollection=${id}`)
        }
    }

    // Initialize edit form when collection loads
    useEffect(() => {
        if (collection) {
            setEditForm({
                name: collection.name || "",
                description: collection.description || "",
                visibility:
                    (collection.visibility as "public" | "private" | "unlisted") || "private",
                coverImage: collection.coverImage || ""
            })
            setImageError(false)
        }
    }, [collection])

    const handleRemoveArtworkClick = (artworkId: string) => {
        setArtworkToRemove(artworkId)
        setRemoveArtworkDialogOpen(true)
    }

    const handleRemoveArtworkConfirm = async () => {
        if (!id || !artworkToRemove) return

        try {
            await removeArtworkFromCollection(id, artworkToRemove)
            queryClient.invalidateQueries({ queryKey: collectionKeys.detail(id) })
            setRemoveArtworkDialogOpen(false)
            setArtworkToRemove(null)
            toast.success("Artwork removed from collection")
        } catch (error: any) {
            toast.error(`Failed to remove artwork: ${error?.message || "An error occurred"}`)
        }
    }

    const handleVisibilityChange = async (newVisibility: "public" | "private" | "unlisted") => {
        if (!id || !collection) return

        try {
            if (newVisibility === "public") {
                const artworks = Array.isArray(collection?.artworks) ? collection.artworks : []
                if (minArtworksForPublish !== undefined && artworks.length < minArtworksForPublish) {
                    toast.error(`Collection must have at least ${minArtworksForPublish} artworks to be public.`)
                    return
                }
                await publishCollection(id)
            } else if (newVisibility === "private") {
                await unpublishCollection(id)
            } else {
                await updateCollection(id, { visibility: "unlisted" })
            }

            queryClient.invalidateQueries({ queryKey: collectionKeys.detail(id) })
            queryClient.invalidateQueries({ queryKey: collectionKeys.lists() })
            toast.success(`Visibility updated to ${newVisibility}`)
        } catch (error: any) {
            toast.error(`Failed to update visibility: ${error?.message || "An error occurred"}`)
        }
    }

    const handleShare = async () => {
        if (!collection) return
        const shareData = {
            title: collection.name,
            text: collection.description || `Check out this collection: ${collection.name}`,
            url: window.location.href
        }

        try {
            if (navigator.share) {
                await navigator.share(shareData)
            } else {
                await navigator.clipboard.writeText(window.location.href)
                toast.success("Link copied to clipboard")
            }
        } catch (error) {
            if ((error as Error).name !== "AbortError") {
                console.error("Error sharing:", error)
            }
        }
    }

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!id) return

        try {
            await deleteCollection(id)
            queryClient.invalidateQueries({ queryKey: collectionKeys.lists() })
            setDeleteDialogOpen(false)
            toast.success("Collection deleted successfully")
            navigate(backHref)
        } catch (error: any) {
            toast.error(`Failed to delete collection: ${error?.message || "An error occurred"}`)
        }
    }

    const handleEditClick = () => {
        if (collection) {
            setEditForm({
                name: collection.name || "",
                description: collection.description || "",
                visibility:
                    (collection.visibility as "public" | "private" | "unlisted") || "private",
                coverImage: collection.coverImage || ""
            })
            setCoverImageFile(null)
            setCoverImagePreview("")
            setIsEditModalOpen(true)
        }
    }

    const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setCoverImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setCoverImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleUpdateCollection = async () => {
        if (!id || !editForm.name.trim()) {
            toast.error("Collection name is required")
            return
        }

        try {
            let coverImageUrl = editForm.coverImage

            // Upload cover image if selected
            if (coverImageFile) {
                setIsUploadingCover(true)
                try {
                    const presignedResponse = await getPresignedUrl({
                        fileName: coverImageFile.name,
                        contentType: coverImageFile.type
                    })

                    if (!presignedResponse.success || !presignedResponse.presignedUrl) {
                        throw new Error("Failed to get upload URL")
                    }

                    await uploadFileToS3(presignedResponse.presignedUrl, coverImageFile)
                    coverImageUrl = presignedResponse.publicUrl
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

            // Update collection
            await updateCollection(id, {
                ...editForm,
                coverImage: coverImageUrl || undefined
            })

            // Refresh collection data
            queryClient.invalidateQueries({ queryKey: collectionKeys.detail(id) })
            queryClient.invalidateQueries({ queryKey: collectionKeys.lists() })
            setIsEditModalOpen(false)
        } catch (error: any) {
            console.error("Failed to update collection:", error)
        }
    }

    if (isLoading) {
        return <CollectionDetailSkeleton />
    }

    if (error || !collection) {
        return (
            <div className="container mx-auto px-4 py-8">
                <EmptyState
                    icon={FolderOpen}
                    title="Collection Not Found"
                    description="This collection doesn't exist or you don't have access to it."
                    actionLabel="Back to Collections"
                    onAction={() => navigate(backHref)}
                />
            </div>
        )
    }

    // Handle artworks - backend returns artworks array directly
    const artworks = Array.isArray(collection?.artworks) ? collection.artworks : []

    // Map artworks using the mapper utility
    const mappedArtworks = artworks.map((artwork: any) => mapArtworkToCardProps(artwork))

    // Split artworks: first 3 for right column, rest for continuous grid
    const featuredArtworks = mappedArtworks.slice(0, 3)
    const remainingArtworks = mappedArtworks.slice(3)

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto max-w-7xl px-4 py-6">
                {/* Cover Image Section */}
                <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <div className="relative h-48 w-full overflow-hidden bg-gray-100 md:h-64">
                        {collection.coverImage && !imageError ? (
                            <img
                                src={collection.coverImage}
                                alt={collection.name}
                                className="h-full w-full object-cover"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                <FolderOpen className="h-16 w-16 text-gray-400 md:h-24 md:w-24" />
                            </div>
                        )}
                        
                        {/* Back Button Overlay */}
                        <div className="absolute top-3 left-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(backHref)}
                                className="h-8 w-8 bg-white/90 backdrop-blur-sm hover:bg-white"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Collection Name Only */}
                    <div className="p-4 md:p-6">
                        <div className="flex items-center justify-between">
                            <h1 className="font-bold text-2xl text-gray-900 md:text-3xl">
                                {collection.name}
                            </h1>
                            {isOwner && (
                                <div className="flex items-center gap-2">
                                    {/* Visibility Dropdown */}
                                    <DropdownMenu modal={false}>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 gap-2 border-gray-200 text-xs shadow-sm hover:bg-gray-50"
                                                disabled={isUpdating || isPublishing || isUnpublishing}
                                            >
                                                {isUpdating || isPublishing || isUnpublishing ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : collection.visibility === "public" ? (
                                                    <Globe className="h-3.5 w-3.5 text-green-600" />
                                                ) : collection.visibility === "unlisted" ? (
                                                    <EyeOff className="h-3.5 w-3.5 text-yellow-600" />
                                                ) : (
                                                    <Lock className="h-3.5 w-3.5 text-gray-500" />
                                                )}
                                                <span className="capitalize">{collection.visibility}</span>
                                                <ChevronDown className="h-3 w-3 opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40">
                                            <DropdownMenuItem
                                                onClick={() => handleVisibilityChange("private")}
                                                className="gap-2"
                                            >
                                                <Lock className="h-4 w-4 text-gray-500" />
                                                <span>Private</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleVisibilityChange("unlisted")}
                                                className="gap-2"
                                            >
                                                <EyeOff className="h-4 w-4 text-yellow-600" />
                                                <span>Unlisted</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleVisibilityChange("public")}
                                                className="gap-2"
                                            >
                                                <Globe className="h-4 w-4 text-green-600" />
                                                <span>Public</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    {/* Share Button (Only if not private) */}
                                    {collection.visibility !== "private" && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleShare}
                                            className="h-8 w-8 p-0 border-gray-200 shadow-sm hover:bg-gray-50"
                                            title="Share Collection"
                                        >
                                            <Share2 className="h-3.5 w-3.5 text-gray-600" />
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleEditClick}
                                        className="text-xs md:text-sm"
                                    >
                                        <Edit2 className="mr-1 h-3 w-3 md:mr-2 md:h-4 md:w-4" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDeleteClick}
                                        className="text-red-600 text-xs hover:bg-red-50 hover:text-red-700 md:text-sm"
                                    >
                                        <Trash2 className="mr-1 h-3 w-3 md:mr-2 md:h-4 md:w-4" />
                                        Delete
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Newspaper Style Layout: Description and Artworks */}
                <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {/* Left Column: Description */}
                    <div className="lg:col-span-1">
                        {collection.description && (
                            <div className="border-gray-200 border-l-2 py-2 pl-4">
                                <h2 className="mb-2.5 font-medium text-gray-500 text-sm uppercase tracking-wide">
                                    Description
                                </h2>
                                <CollectionDescription text={collection.description} />
                            </div>
                        )}
                    </div>

                    {/* Right Column: Featured Artworks */}
                    <div className="lg:col-span-1">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-gray-600 text-xs">
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
                                    <Plus className="mr-1 h-3 w-3" />
                                    Add Artwork
                                </Button>
                            )}
                        </div>
                        {featuredArtworks.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                {featuredArtworks.map((artwork) => (
                                    <div key={artwork.id} className="group relative">
                                        <ArtworkCard {...artwork} />
                                        {isOwner && (
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-1.5 right-1.5 z-20 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    e.preventDefault()
                                                    handleRemoveArtworkClick(artwork.id)
                                                }}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded border border-gray-200 bg-white p-6 text-center">
                                <FolderOpen className="mx-auto mb-2 h-6 w-6 text-gray-400" />
                                <p className="text-gray-600 text-xs">
                                    No artworks in this collection yet.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Continuous Artworks Grid Below */}
                {remainingArtworks.length > 0 && (
                    <div className="mb-4">
                        <h2 className="mb-3 font-semibold text-base text-gray-900">All Artworks</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                            {remainingArtworks.map((artwork) => (
                                <div key={artwork.id} className="group relative">
                                    <ArtworkCard {...artwork} />
                                    {isOwner && (
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-1.5 right-1.5 z-10 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                                            onClick={() => handleRemoveArtworkClick(artwork.id)}
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
                        actionLabel={
                            isOwner
                                ? "Browse Artworks"
                                : isGuest
                                    ? "Sign in to create a collection"
                                    : undefined
                        }
                        onAction={
                            isOwner
                                ? handleAddArtwork
                                : isGuest
                                    ? () =>
                                        navigate(
                                            `/login?redirect=${encodeURIComponent(`/collections/${id}`)}`
                                        )
                                    : undefined
                        }
                    />
                )}

                {/* Edit Collection Modal */}
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto bg-white">
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
                                        <div className="relative h-32 w-full overflow-hidden rounded-md border border-gray-200">
                                            <img
                                                src={coverImagePreview || collection.coverImage}
                                                alt="Cover preview"
                                                className="h-full w-full object-cover"
                                            />
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2 h-6 w-6"
                                                onClick={() => {
                                                    setCoverImageFile(null)
                                                    setCoverImagePreview("")
                                                    setEditForm({ ...editForm, coverImage: "" })
                                                }}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ) : null}
                                    <label
                                        htmlFor="edit-cover-upload"
                                        className="flex h-10 w-full cursor-pointer items-center justify-center rounded-md border-2 border-gray-300 border-dashed transition-colors hover:border-gray-400"
                                    >
                                        <Upload className="mr-2 h-4 w-4 text-gray-500" />
                                        <span className="text-gray-600 text-sm">
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
                                    className="bg-red-700 text-white hover:bg-red-800"
                                >
                                    {isUpdating || isUploadingCover ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

                {/* Delete Collection Confirmation Dialog */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Collection</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete this collection? This action cannot
                                be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteConfirm}
                                className="bg-red-600 text-white hover:bg-red-700"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Remove Artwork Confirmation Dialog */}
                <AlertDialog
                    open={removeArtworkDialogOpen}
                    onOpenChange={setRemoveArtworkDialogOpen}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Remove Artwork</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to remove this artwork from the collection?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setArtworkToRemove(null)}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleRemoveArtworkConfirm}
                                className="bg-red-600 text-white hover:bg-red-700"
                            >
                                Remove
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    )
}
