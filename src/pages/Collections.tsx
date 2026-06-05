import { ProtectedRoute } from "@/components/auth/protected-route"
import { truncateCollectionName, CollectionCoverImage } from "@/components/collections/collection-card"
import { CollectionsSkeleton } from "@/components/skeletons/collections-skeleton"
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useMyCollections } from "@/queries/collectionQueries"
import { useCollectionSettings } from "@/queries/settingsQueries"
import { collectionKeys } from "@/queries/queryKeys"
import { useGetPresignedImageUploadUrl } from "@/queries/uploadQueries"
import { useCreateCollection } from "@/services/collections/useCreateCollection"
import { useDeleteCollection } from "@/services/collections/useDeleteCollection"
import { usePublishCollection } from "@/services/collections/usePublishCollection"
import { useUnpublishCollection } from "@/services/collections/useUnpublishCollection"
import { useUpdateCollection } from "@/services/collections/useUpdateCollection"
import { uploadFileToS3 } from "@/services/upload"
import { useQueryClient } from "@tanstack/react-query"
import {
    ArrowLeft,
    ChevronDown,
    EyeOff,
    FolderOpen,
    Globe,
    Grid,
    Image as ImageIcon,
    List,
    Loader2,
    Lock,
    Plus,
    Trash2,
    Upload,
    X
} from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

// Simple pagination component
const Pagination = ({
    currentPage,
    totalPages,
    onPageChange
}: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) => (
    <div className="flex items-center justify-center gap-2">
        <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
        >
            Previous
        </Button>
        <span className="text-gray-600 text-sm">
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
)

export default function CollectionsPage() {
    const [page, setPage] = useState(1)
    const limit = 12
    const navigate = useNavigate()
    const { data, isLoading, error } = useMyCollections(page, limit)
    const { deleteCollection, isDeleting } = useDeleteCollection()
    const { publishCollection, isPublishing } = usePublishCollection()
    const { unpublishCollection, isUnpublishing } = useUnpublishCollection()
    const { updateCollection, isUpdating } = useUpdateCollection()
    const { createCollection, isCreating } = useCreateCollection()
    const { mutateAsync: getPresignedUrl } = useGetPresignedImageUploadUrl()
    const queryClient = useQueryClient()

    // View mode state
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

    // Create collection modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [newCollection, setNewCollection] = useState({
        name: "",
        description: "",
        visibility: "private",
        coverImage: ""
    })
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
    const [coverImagePreview, setCoverImagePreview] = useState<string>("")
    const [isUploadingCover, setIsUploadingCover] = useState(false)
    const [collectionImageErrors, setCollectionImageErrors] = useState<Record<string, boolean>>({})

    // Delete confirmation dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [collectionToDelete, setCollectionToDelete] = useState<string | null>(null)

    const collections = data?.collections || []
    const pagination = data
        ? {
              page: data.page || (data as any).pagination?.page || 1,
              limit: data.limit || (data as any).pagination?.limit || limit,
              total: data.total ?? (data as any).pagination?.total ?? 0,
              pages: data.pages || (data as any).pagination?.pages || 1
          }
        : { page: 1, limit, total: 0, pages: 1 }

    const handleDeleteClick = (collectionId: string) => {
        setCollectionToDelete(collectionId)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!collectionToDelete) return

        try {
            await deleteCollection(collectionToDelete)
            queryClient.invalidateQueries({ queryKey: collectionKeys.lists() })
            setDeleteDialogOpen(false)
            setCollectionToDelete(null)
            toast.success("Collection deleted successfully")
        } catch (error: any) {
            toast.error(`Failed to delete collection: ${error?.message || "An error occurred"}`)
        }
    }

    const { data: collectionSettings } = useCollectionSettings()
    const minArtworksToPublish = collectionSettings?.settings?.minArtworksForPublish

    const handleVisibilityChange = async (
        collectionId: string,
        newVisibility: string,
        artworkCount = 0
    ) => {
        try {
            if (newVisibility === "public") {
                if (minArtworksToPublish !== undefined && artworkCount < minArtworksToPublish) {
                    toast.error(
                        `Collection must have at least ${minArtworksToPublish} artworks to be published. Currently has ${artworkCount}.`
                    )
                    return
                }
                await publishCollection(collectionId)
            } else if (newVisibility === "unlisted") {
                await updateCollection(collectionId, { visibility: "unlisted" } as any)
            } else if (newVisibility === "private") {
                await unpublishCollection(collectionId)
            }
            queryClient.invalidateQueries({ queryKey: collectionKeys.lists() })
        } catch (error: any) {
            // Error handled by hook
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

    const handleCreateCollection = async () => {
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

            // Create collection
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
            setIsCreateModalOpen(false)

            // Refresh collections list
            queryClient.invalidateQueries({ queryKey: collectionKeys.lists() })
            toast.success("Collection created successfully!")
        } catch (error: any) {
            toast.error(`Failed to create collection: ${error?.message || "An error occurred"}`)
        }
    }

    if (isLoading) {
        return (
            <ProtectedRoute>
                <CollectionsSkeleton />
            </ProtectedRoute>
        )
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
        )
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-white">
                <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8">
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex items-start gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate("/profile")}
                                className="mt-1 h-9 w-9 shrink-0 rounded-full"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <p className="mb-2 font-semibold text-[11px] text-red-700 uppercase tracking-[0.22em]">
                                    Profile
                                </p>
                                <h1 className="font-poppins font-semibold text-[1.85rem] text-gray-900 leading-tight sm:text-[2.35rem]">
                                    My Collections
                                </h1>
                                <p className="mt-2 text-gray-500 text-sm">
                                    {pagination.total}{" "}
                                    {pagination.total === 1 ? "collection" : "collections"}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex h-9 items-center gap-0.5 rounded-full border border-gray-200 bg-white px-1">
                                <Button
                                    variant={viewMode === "grid" ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setViewMode("grid")}
                                    className={`h-7 w-8 rounded-full ${
                                        viewMode === "grid"
                                            ? "bg-red-50 text-red-700 hover:bg-red-100"
                                            : "text-gray-500"
                                    }`}
                                >
                                    <Grid className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    variant={viewMode === "list" ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setViewMode("list")}
                                    className={`h-7 w-8 rounded-full ${
                                        viewMode === "list"
                                            ? "bg-red-50 text-red-700 hover:bg-red-100"
                                            : "text-gray-500"
                                    }`}
                                >
                                    <List className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                            <Button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="rounded-full bg-red-700 text-white hover:bg-red-800"
                            >
                                <Plus className="mr-1.5 h-4 w-4" />
                                Create collection
                            </Button>
                        </div>
                    </div>

                    {/* Collections Display */}
                    {collections.length > 0 ? (
                        <>
                            {viewMode === "grid" ? (
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {collections.map((collection) => (
                                        <div
                                            key={collection.id}
                                            className="rounded-xl border border-gray-200 bg-white"
                                        >
                                            <Link
                                                to={`/collections/${collection.id}`}
                                                state={{ from: "/profile/collections" }}
                                                className="block overflow-hidden rounded-t-[11px]"
                                            >
                                                <div className="relative aspect-[4/3]">
                                                    {collection.coverImage && !collectionImageErrors[collection.id] ? (
                                                        <CollectionCoverImage
                                                            src={collection.coverImage}
                                                            alt={collection.name}
                                                            onError={() => setCollectionImageErrors(prev => ({ ...prev, [collection.id]: true }))}
                                                            className="absolute inset-0 h-full w-full"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center bg-stone-100 text-gray-400 text-sm">
                                                            No cover
                                                        </div>
                                                    )}
                                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/5" />
                                                    <div className="pointer-events-none absolute top-3 right-3">
                                                        <span
                                                            className={`rounded-full px-2.5 py-1 font-medium text-[11px] capitalize backdrop-blur-sm ${
                                                                collection.visibility === "public"
                                                                    ? "bg-green-600/90 text-white"
                                                                    : collection.visibility === "unlisted"
                                                                      ? "bg-amber-500/90 text-white"
                                                                      : "bg-gray-700/90 text-white"
                                                            }`}
                                                        >
                                                            {collection.visibility}
                                                        </span>
                                                    </div>
                                                    <div className="pointer-events-none absolute right-0 bottom-0 left-0 p-4">
                                                        <h3
                                                            className="truncate font-semibold text-white text-base leading-snug sm:text-lg"
                                                            title={collection.name}
                                                        >
                                                            {truncateCollectionName(collection.name)}
                                                        </h3>
                                                        <span className="mt-2 inline-flex items-center gap-1 text-white/85 text-xs sm:text-sm">
                                                            <ImageIcon className="h-3.5 w-3.5" />
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
                                            </Link>

                                            <div className="flex items-center justify-between px-4 py-3">
                                                <span className="text-gray-500 text-sm">
                                                    Manage visibility
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <DropdownMenu modal={false}>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-6 gap-1 border-gray-200 px-2 text-[10px] shadow-sm hover:bg-gray-50 focus:ring-0 focus:ring-offset-0"
                                                                disabled={isUpdating || isPublishing || isUnpublishing}
                                                            >
                                                                {isUpdating || isPublishing || isUnpublishing ? (
                                                                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                                                ) : collection.visibility === "public" ? (
                                                                    <Globe className="h-2.5 w-2.5 text-green-600" />
                                                                ) : collection.visibility === "unlisted" ? (
                                                                    <EyeOff className="h-2.5 w-2.5 text-yellow-600" />
                                                                ) : (
                                                                    <Lock className="h-2.5 w-2.5 text-gray-500" />
                                                                )}
                                                                <span className="capitalize">{collection.visibility}</span>
                                                                <ChevronDown className="h-2.5 w-2.5 opacity-50" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-32">
                                                            <DropdownMenuItem
                                                                onClick={() => handleVisibilityChange(collection.id, "private", collection.artworkCount ?? 0)}
                                                                className="gap-2 text-[10px]"
                                                            >
                                                                <Lock className="h-3.5 w-3.5 text-gray-500" />
                                                                <span>Private</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleVisibilityChange(collection.id, "unlisted", collection.artworkCount ?? 0)}
                                                                className="gap-2 text-[10px]"
                                                            >
                                                                <EyeOff className="h-3.5 w-3.5 text-yellow-600" />
                                                                <span>Unlisted</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleVisibilityChange(collection.id, "public", collection.artworkCount ?? 0)}
                                                                className="gap-2 text-[10px]"
                                                                disabled={minArtworksToPublish !== undefined && (collection.artworkCount ?? 0) < minArtworksToPublish}
                                                            >
                                                                <Globe className="h-3.5 w-3.5 text-green-600" />
                                                                <span>Public</span>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.preventDefault()
                                                            e.stopPropagation()
                                                            handleDeleteClick(collection.id)
                                                        }}
                                                        disabled={isDeleting}
                                                        className="h-6 w-6 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {collections.map((collection) => (
                                        <div
                                            key={collection.id}
                                            className="rounded-xl border border-gray-200 bg-white"
                                        >
                                            <div className="flex items-stretch overflow-hidden rounded-t-[11px]">
                                                <Link
                                                    to={`/collections/${collection.id}`}
                                                    state={{ from: "/profile/collections" }}
                                                    className="flex min-w-0 flex-1 items-center"
                                                >
                                                    {collection.coverImage && !collectionImageErrors[collection.id] ? (
                                                        <CollectionCoverImage
                                                            src={collection.coverImage}
                                                            alt={collection.name}
                                                            onError={() => setCollectionImageErrors(prev => ({ ...prev, [collection.id]: true }))}
                                                            className="h-28 w-36 shrink-0 sm:h-32 sm:w-44"
                                                        />
                                                    ) : (
                                                        <div className="flex h-28 w-36 shrink-0 items-center justify-center bg-stone-100 text-gray-400 text-xs sm:h-32 sm:w-44">
                                                            No cover
                                                        </div>
                                                    )}

                                                    <div className="min-w-0 flex-1 px-4 py-3 sm:px-5">
                                                        <div className="mb-1 flex items-center gap-2">
                                                            <h3
                                                                className="truncate font-semibold text-base text-gray-900 sm:text-lg"
                                                                title={collection.name}
                                                            >
                                                                {truncateCollectionName(collection.name)}
                                                            </h3>
                                                            <span
                                                                className={`shrink-0 rounded-full px-2 py-0.5 font-medium text-[10px] capitalize ${
                                                                    collection.visibility === "public"
                                                                        ? "bg-green-100 text-green-700"
                                                                        : collection.visibility === "unlisted"
                                                                          ? "bg-amber-100 text-amber-700"
                                                                          : "bg-gray-100 text-gray-600"
                                                                }`}
                                                            >
                                                                {collection.visibility}
                                                            </span>
                                                        </div>
                                                        <span className="flex items-center gap-1 text-gray-500 text-sm">
                                                            <ImageIcon className="h-3.5 w-3.5" />
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
                                                </Link>

                                                {/* Action Buttons */}
                                                <div className="flex items-center gap-1 px-3">
                                                    <DropdownMenu modal={false}>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-7 gap-1.5 border-gray-200 px-2.5 text-xs shadow-sm hover:bg-gray-50 focus:ring-0 focus:ring-offset-0"
                                                                disabled={isUpdating || isPublishing || isUnpublishing}
                                                            >
                                                                {isUpdating || isPublishing || isUnpublishing ? (
                                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                                ) : collection.visibility === "public" ? (
                                                                    <Globe className="h-3 w-3 text-green-600" />
                                                                ) : collection.visibility === "unlisted" ? (
                                                                    <EyeOff className="h-3 w-3 text-yellow-600" />
                                                                ) : (
                                                                    <Lock className="h-3 w-3 text-gray-500" />
                                                                )}
                                                                <span className="capitalize">{collection.visibility}</span>
                                                                <ChevronDown className="h-3 w-3 opacity-50" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-32">
                                                            <DropdownMenuItem
                                                                onClick={() => handleVisibilityChange(collection.id, "private", collection.artworkCount ?? 0)}
                                                                className="gap-2 text-xs"
                                                            >
                                                                <Lock className="h-4 w-4 text-gray-500" />
                                                                <span>Private</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleVisibilityChange(collection.id, "unlisted", collection.artworkCount ?? 0)}
                                                                className="gap-2 text-xs"
                                                            >
                                                                <EyeOff className="h-4 w-4 text-yellow-600" />
                                                                <span>Unlisted</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleVisibilityChange(collection.id, "public", collection.artworkCount ?? 0)}
                                                                className="gap-2 text-xs"
                                                                disabled={minArtworksToPublish !== undefined && (collection.artworkCount ?? 0) < minArtworksToPublish}
                                                            >
                                                                <Globe className="h-4 w-4 text-green-600" />
                                                                <span>Public</span>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.preventDefault()
                                                            e.stopPropagation()
                                                            handleDeleteClick(collection.id)
                                                        }}
                                                        disabled={isDeleting}
                                                        className="h-7 w-7 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
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
                <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border-gray-200 bg-white">
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
                                className="border-gray-200 focus:border-gray-300 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:border-gray-300 focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={newCollection.description}
                                onChange={(e) =>
                                    setNewCollection({
                                        ...newCollection,
                                        description: e.target.value
                                    })
                                }
                                placeholder="Describe your collection..."
                                rows={4}
                                className="border-gray-200 focus:border-gray-300 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:border-gray-300 focus-visible:ring-0 focus-visible:ring-offset-0"
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
                                <SelectTrigger className="border-gray-200 focus:border-gray-300 focus:outline-none focus:ring-0 focus:ring-offset-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="private">Private</SelectItem>
                                    <SelectItem value="unlisted">Unlisted</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="mt-1 text-muted-foreground text-xs">
                                Collections need at least {minArtworksToPublish} artworks to be published. Publish from
                                the collection page once you’ve added enough.
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="cover">Cover Image</Label>
                            <div className="mt-2 space-y-2">
                                {coverImagePreview ? (
                                    <div className="relative h-32 w-full overflow-hidden rounded-md border border-gray-200">
                                        <img
                                            src={coverImagePreview}
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
                                            }}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ) : null}
                                <label
                                    htmlFor="cover-upload"
                                    className="flex h-10 w-full cursor-pointer items-center justify-center rounded-md border-2 border-gray-300 border-dashed transition-colors hover:border-gray-400"
                                >
                                    <Upload className="mr-2 h-4 w-4 text-gray-500" />
                                    <span className="text-gray-600 text-sm">
                                        {coverImagePreview
                                            ? "Change Cover Image"
                                            : "Upload Cover Image"}
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
                                    setIsCreateModalOpen(false)
                                    setNewCollection({
                                        name: "",
                                        description: "",
                                        visibility: "private",
                                        coverImage: ""
                                    })
                                    setCoverImageFile(null)
                                    setCoverImagePreview("")
                                }}
                                disabled={isCreating || isUploadingCover}
                                className="rounded-full"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateCollection}
                                disabled={
                                    isCreating || isUploadingCover || !newCollection.name.trim()
                                }
                                className="rounded-full bg-red-700 text-white hover:bg-red-800"
                            >
                                {isCreating || isUploadingCover ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
                            Are you sure you want to delete this collection? This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setCollectionToDelete(null)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
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
