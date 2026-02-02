import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
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
import { useMyCollections } from "@/queries/collectionQueries"
import { collectionKeys } from "@/queries/queryKeys"
import { useGetPresignedImageUploadUrl } from "@/queries/uploadQueries"
import { useAddArtworkToCollection } from "@/services/collections/useAddArtworkToCollection"
import { useCreateCollection } from "@/services/collections/useCreateCollection"
import { uploadFileToS3 } from "@/services/upload"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { useQueryClient } from "@tanstack/react-query"
import { FolderOpen, FolderPlus, Loader2, Upload, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface ArtworkCollectionManagerProps {
    artworkId: string
}

export function ArtworkCollectionManager({ artworkId }: ArtworkCollectionManagerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [selectedCollectionIds, setSelectedCollectionIds] = useState<Set<string>>(new Set())
    const { data, isLoading, refetch } = useMyCollections(1, 100) // Get all collections
    const { addArtwork, isAdding } = useAddArtworkToCollection()
    const { createCollection, isCreating } = useCreateCollection()
    const { mutateAsync: getPresignedUrl } = useGetPresignedImageUploadUrl()
    const queryClient = useQueryClient()

    const collections = data?.collections || []

    // Collection creation form state
    const [newCollection, setNewCollection] = useState({
        name: "",
        description: "",
        visibility: "private",
        coverImage: ""
    })
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
    const [coverImagePreview, setCoverImagePreview] = useState<string>("")
    const [isUploadingCover, setIsUploadingCover] = useState(false)

    const handleToggleCollection = (collectionId: string) => {
        setSelectedCollectionIds((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(collectionId)) {
                newSet.delete(collectionId)
            } else {
                newSet.add(collectionId)
            }
            return newSet
        })
    }

    const handleAddToCollections = async () => {
        if (selectedCollectionIds.size === 0) {
            toast.error("Please select at least one collection")
            return
        }

        try {
            // Add artwork to all selected collections
            const promises = Array.from(selectedCollectionIds).map((collectionId) =>
                addArtwork(collectionId, artworkId)
            )

            await Promise.all(promises)

            // Invalidate queries for all selected collections
            selectedCollectionIds.forEach((collectionId) => {
                queryClient.invalidateQueries({ queryKey: collectionKeys.detail(collectionId) })
            })

            toast.success(
                `Artwork added to ${selectedCollectionIds.size} collection${selectedCollectionIds.size > 1 ? "s" : ""}`
            )
            setIsOpen(false)
            setSelectedCollectionIds(new Set())
        } catch (error: any) {
            console.error("Failed to add artwork to collections:", error)
            toast.error("Failed to add artwork to some collections")
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
            const refetchResult = await refetch()

            // Close create modal but keep the main modal open
            setIsCreateModalOpen(false)

            // Automatically select the newly created collection
            if (response?.collection?.id) {
                setSelectedCollectionIds((prev) => new Set(prev).add(response.collection.id))
            } else if (
                refetchResult?.data?.collections &&
                refetchResult.data.collections.length > 0
            ) {
                // If we can't get the ID from response, select the first collection (should be the newest)
                const newestCollection = refetchResult.data.collections[0]
                setSelectedCollectionIds((prev) => new Set(prev).add(newestCollection.id))
            }
        } catch (error: any) {
            console.error("Failed to create collection:", error)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-full justify-start rounded-full border-gray-200 bg-white text-gray-700 text-xs hover:bg-gray-50"
                >
                    <FolderPlus className="mr-1.5 h-3.5 w-3.5" />
                    Add to Collection
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-semibold text-gray-900 text-lg">
                        Add to Collection
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 text-sm">
                        Select one or more collections to add this artwork to.
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        </div>
                    ) : collections.length === 0 ? (
                        <div className="rounded-lg bg-gray-50 p-6 text-center">
                            <FolderOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                            <p className="mb-2 font-medium text-gray-700">No collections yet</p>
                            <p className="mb-4 text-gray-500 text-sm">
                                Create your first collection to organize your favorite artworks.
                            </p>
                            <Button
                                className="rounded-full bg-red-700 text-white hover:bg-red-800"
                                onClick={() => setIsCreateModalOpen(true)}
                            >
                                Create Collection
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-2 flex items-center justify-between">
                                <p className="text-gray-600 text-sm">
                                    {selectedCollectionIds.size > 0 && (
                                        <span className="font-medium text-red-700">
                                            {selectedCollectionIds.size} collection
                                            {selectedCollectionIds.size > 1 ? "s" : ""} selected
                                        </span>
                                    )}
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="rounded-full text-sm"
                                >
                                    <FolderPlus className="mr-2 h-4 w-4" />
                                    New Collection
                                </Button>
                            </div>
                            <div className="max-h-[300px] space-y-2 overflow-y-auto">
                                {collections.map((collection) => {
                                    const isSelected = selectedCollectionIds.has(collection.id)
                                    return (
                                        <button
                                            key={collection.id}
                                            type="button"
                                            onClick={() => handleToggleCollection(collection.id)}
                                            className={`w-full rounded-lg border p-3 text-left transition-all ${
                                                isSelected
                                                    ? "border-red-700 bg-red-50"
                                                    : "border-gray-200 bg-white hover:border-gray-300"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-all ${
                                                        isSelected
                                                            ? "border-red-700 bg-red-700"
                                                            : "border-gray-300 bg-white"
                                                    }`}
                                                >
                                                    {isSelected && (
                                                        <svg
                                                            className="h-3 w-3 text-white"
                                                            fill="none"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <FolderOpen
                                                    className={`h-5 w-5 flex-shrink-0 ${
                                                        isSelected
                                                            ? "text-red-700"
                                                            : "text-gray-500"
                                                    }`}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <div
                                                        className={`font-medium text-sm ${
                                                            isSelected
                                                                ? "text-red-900"
                                                                : "text-gray-900"
                                                        }`}
                                                    >
                                                        {collection.name}
                                                    </div>
                                                    {collection.description && (
                                                        <div className="mt-1 line-clamp-1 text-gray-500 text-xs">
                                                            {collection.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                            <div className="flex justify-end gap-3 border-gray-200 border-t pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsOpen(false)
                                        setSelectedCollectionIds(new Set())
                                    }}
                                    disabled={isAdding}
                                    className="rounded-full"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAddToCollections}
                                    disabled={selectedCollectionIds.size === 0 || isAdding}
                                    className="rounded-full bg-red-700 text-white hover:bg-red-800"
                                >
                                    {isAdding ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            Add to{" "}
                                            {selectedCollectionIds.size > 0
                                                ? `${selectedCollectionIds.size} `
                                                : ""}
                                            Collection{selectedCollectionIds.size > 1 ? "s" : ""}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>

            {/* Create Collection Modal — z-index above Add to Collection dialog (101) so it appears on top */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} modal={true}>
                <DialogPortal>
                    <DialogOverlay className="z-[110] bg-black/40" />
                    <DialogPrimitive.Content className="data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed top-[50%] left-[50%] z-[111] grid max-h-[90vh] w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 overflow-y-auto border bg-white p-6 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in sm:rounded-lg">
                        <DialogHeader>
                            <DialogTitle className="font-semibold text-gray-900 text-lg">
                                Create New Collection
                            </DialogTitle>
                            <DialogDescription className="text-gray-600 text-sm">
                                Create a new collection and add this artwork to it.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="collectionName">Collection Name *</Label>
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
                                <Label htmlFor="collectionDescription">Description</Label>
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
                                <Label htmlFor="collectionCoverImage">Cover Image (Optional)</Label>
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
                                        <div className="rounded-lg border-2 border-gray-300 border-dashed p-6 text-center">
                                            <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                            <Label
                                                htmlFor="coverImageInput"
                                                className="cursor-pointer text-gray-600 text-sm hover:text-gray-900"
                                            >
                                                Click to upload cover image
                                            </Label>
                                            <Input
                                                id="coverImageInput"
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

                                                    setCoverImageFile(file)
                                                    setCoverImagePreview(URL.createObjectURL(file))
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
                                            visibility: value
                                        })
                                    }
                                >
                                    <SelectTrigger id="collectionVisibility">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="private">Private</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-muted-foreground text-xs">
                                    Collections need at least 3 artworks to be published. Create as
                                    private or unlisted, then publish from the collection page.
                                </p>
                            </div>
                            <div className="flex justify-end gap-3 border-gray-200 border-t pt-4">
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
                                        "Create & Add Artwork"
                                    )}
                                </Button>
                            </div>
                        </div>
                        <DialogPrimitive.Close className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </DialogPrimitive.Close>
                    </DialogPrimitive.Content>
                </DialogPortal>
            </Dialog>
        </Dialog>
    )
}
