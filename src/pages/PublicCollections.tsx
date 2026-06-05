import { PublicCollectionsSkeleton } from "@/components/skeletons/public-collections-skeleton"
import { CollectionGridCard, CollectionListRow } from "@/components/collections/collection-card"
import { Badge } from "@/components/ui/badge"
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
import { cn } from "@/lib/utils"
import { useCollections, useHotCollections } from "@/queries/collectionQueries"
import { collectionKeys } from "@/queries/queryKeys"
import { useGetPresignedImageUploadUrl } from "@/queries/uploadQueries"
import { useCreateCollection } from "@/services/collections/useCreateCollection"
import { uploadFileToS3 } from "@/services/upload"
import { useQueryClient } from "@tanstack/react-query"
import {
    FolderOpen,
    Grid,
    List,
    Loader2,
    Plus,
    Search,
    Upload,
    X
} from "lucide-react"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

export default function PublicCollectionsPage() {
    const [page, setPage] = useState(1)
    const limit = 12
    const [searchTerm, setSearchTerm] = useState("")
    const [showFilters, setShowFilters] = useState(false)
    const [sortBy, setSortBy] = useState<string>("newest")
    const [artworkCountRange, setArtworkCountRange] = useState<string>("all")
    const [quickFilter, setQuickFilter] = useState<string>("")
    const navigate = useNavigate()
    const { user } = useAuth()
    const { createCollection, isCreating } = useCreateCollection()
    const { mutateAsync: getPresignedUrl } = useGetPresignedImageUploadUrl()
    const queryClient = useQueryClient()

    // Only fetch public collections - don't pass visibility param to use default "public"
    const { data, isLoading, error } = useCollections(page, limit)

    // Fetch hot collections sorted by engagement score
    const { data: hotCollectionsData, isLoading: isLoadingHotCollections } = useHotCollections(6)

    // View mode state
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

    // Create collection modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [newCollection, setNewCollection] = useState({
        name: "",
        description: "",
        visibility: "private" as "private" | "unlisted",
        coverImage: ""
    })
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
    const [coverImagePreview, setCoverImagePreview] = useState<string>("")
    const [isUploadingCover, setIsUploadingCover] = useState(false)
    const [collectionImageErrors, setCollectionImageErrors] = useState<Record<string, boolean>>({})

    const collections = data?.collections || []
    const pagination = data
        ? {
            page: data.page || (data as any).pagination?.page || 1,
            limit: data.limit || (data as any).pagination?.limit || limit,
            total: data.total ?? (data as any).pagination?.total ?? 0,
            pages: data.pages || (data as any).pagination?.pages || 1
        }
        : { page: 1, limit, total: 0, pages: 1 }

    const hotCollections = hotCollectionsData?.collections || []

    // Handle quick filter changes
    const handleQuickFilter = (filter: string) => {
        // Toggle: if clicking the same filter, deactivate it
        const newFilter = quickFilter === filter ? "" : filter
        setQuickFilter(newFilter)

        switch (newFilter) {
            case "most-artworks":
                setSortBy("most-artworks")
                setArtworkCountRange("all")
                setSearchTerm("")
                break
            case "recent":
                setSortBy("newest")
                setArtworkCountRange("all")
                setSearchTerm("")
                break
            case "popular":
                // Popular = sorted by engagement score (views, likes, comments, favorites)
                setSortBy("popular")
                setArtworkCountRange("all")
                setSearchTerm("")
                break
            default:
                // Reset to defaults when deactivating
                setSortBy("newest")
                setArtworkCountRange("all")
            // Keep search term - don't reset it
        }
    }

    // Sync quick filter state with actual filter values
    // This ensures the quick filter badge reflects the current state
    const getActiveQuickFilter = () => {
        if (sortBy === "most-artworks" && artworkCountRange === "all" && !searchTerm) {
            return "most-artworks"
        }
        if (sortBy === "newest" && artworkCountRange === "all" && !searchTerm) {
            return "recent"
        }
        if (sortBy === "popular" && artworkCountRange === "all" && !searchTerm) {
            return "popular"
        }
        return ""
    }

    // Calculate active quick filter based on current filter state
    const activeQuickFilter = getActiveQuickFilter()

    // Update quick filter state when manual filters change (sync badge with actual filter state)
    useEffect(() => {
        const calculated = getActiveQuickFilter()
        // Only update if the calculated filter differs from current state
        // This syncs the badge when user manually changes filters
        if (calculated !== quickFilter) {
            setQuickFilter(calculated)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortBy, artworkCountRange, searchTerm])

    // Filter and sort collections
    const filteredCollections = collections
        .filter((collection) => {
            // Search filter
            if (searchTerm) {
                const matchesSearch =
                    collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (collection.description &&
                        collection.description.toLowerCase().includes(searchTerm.toLowerCase()))
                if (!matchesSearch) return false
            }

            // Artwork count range filter
            if (artworkCountRange !== "all") {
                const artworkCount =
                    "artworkCount" in collection && collection.artworkCount !== undefined
                        ? collection.artworkCount
                        : 0

                switch (artworkCountRange) {
                    case "1-5":
                        if (artworkCount < 1 || artworkCount > 5) return false
                        break
                    case "6-10":
                        if (artworkCount < 6 || artworkCount > 10) return false
                        break
                    case "11-20":
                        if (artworkCount < 11 || artworkCount > 20) return false
                        break
                    case "20+":
                        if (artworkCount < 20) return false
                        break
                    default:
                        // Unknown range, don't filter
                        break
                }
            }

            return true
        })
        .sort((a, b) => {
            // Sort collections
            switch (sortBy) {
                case "newest":
                    return (
                        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
                    )
                case "oldest":
                    return (
                        new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
                    )
                case "most-artworks":
                    const aCount =
                        "artworkCount" in a && a.artworkCount !== undefined ? a.artworkCount : 0
                    const bCount =
                        "artworkCount" in b && b.artworkCount !== undefined ? b.artworkCount : 0
                    return bCount - aCount
                case "least-artworks":
                    const aCount2 =
                        "artworkCount" in a && a.artworkCount !== undefined ? a.artworkCount : 0
                    const bCount2 =
                        "artworkCount" in b && b.artworkCount !== undefined ? b.artworkCount : 0
                    return aCount2 - bCount2
                case "alphabetical":
                    return a.name.localeCompare(b.name)
                case "alphabetical-desc":
                    return b.name.localeCompare(a.name)
                case "popular":
                    // Sort by engagement score (if available) or fallback to artwork count
                    const aEngagement =
                        "engagementScore" in a && typeof a.engagementScore === "number"
                            ? a.engagementScore
                            : "artworkCount" in a && a.artworkCount !== undefined
                                ? a.artworkCount
                                : 0
                    const bEngagement =
                        "engagementScore" in b && typeof b.engagementScore === "number"
                            ? b.engagementScore
                            : "artworkCount" in b && b.artworkCount !== undefined
                                ? b.artworkCount
                                : 0
                    return bEngagement - aEngagement
                default:
                    return 0
            }
        })

    const handleCreateCollectionClick = () => {
        if (!user) {
            navigate("/login")
            return
        }
        setIsCreateModalOpen(true)
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
            await createCollection({
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
        return <PublicCollectionsSkeleton />
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto max-w-7xl px-4 py-8">
                    <EmptyState
                        icon={FolderOpen}
                        title="Error Loading Collections"
                        description="Failed to load collections. Please try again later."
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="mb-2 font-semibold text-[11px] text-red-700 uppercase tracking-[0.22em]">
                            Browse
                        </p>
                        <h1 className="font-poppins font-semibold text-[1.85rem] text-gray-900 leading-tight sm:text-[2.35rem]">
                            Collections
                        </h1>
                        <p className="mt-2 text-gray-500 text-sm sm:text-base">
                            {filteredCollections.length}{" "}
                            {filteredCollections.length === 1 ? "collection" : "collections"}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {user && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate("/profile/collections")}
                                    className="rounded-full"
                                >
                                    My collections
                                </Button>
                                <Button
                                    onClick={handleCreateCollectionClick}
                                    className="rounded-full bg-red-700 text-white hover:bg-red-800"
                                >
                                    <Plus className="mr-1.5 h-4 w-4" />
                                    Create collection
                                </Button>
                            </>
                        )}
                        {!user && (
                            <Button
                                variant="outline"
                                onClick={() =>
                                    navigate(`/login?redirect=${encodeURIComponent("/collections")}`)
                                }
                                className="rounded-full"
                            >
                                Sign in to create
                            </Button>
                        )}
                    </div>
                </div>

                {!isLoadingHotCollections && hotCollections.length > 0 && (
                    <section className="mb-10">
                        <h2 className="mb-4 font-semibold text-gray-900 text-lg">Featured collections</h2>
                        <div className="scrollbar-hide -mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
                            {hotCollections.map((collection) => (
                                <div key={collection.id} className="w-[min(85vw,320px)] shrink-0 sm:w-80">
                                    <CollectionGridCard
                                        collection={collection}
                                        featured
                                        imageError={collectionImageErrors[collection.id]}
                                        onImageError={() =>
                                            setCollectionImageErrors((prev) => ({
                                                ...prev,
                                                [collection.id]: true
                                            }))
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <section>
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="font-medium text-gray-900 text-sm sm:text-base">
                            All collections
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                {showFilters ? "Hide filters" : "Filters"}
                            </Button>
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
                        </div>
                    </div>

                    {/* Quick Filter Chips */}
                    <div className="mb-3 flex flex-wrap gap-1.5">
                        <Badge
                            variant="outline"
                            className={cn(
                                "cursor-pointer px-2 py-0.5 text-xs",
                                activeQuickFilter === "most-artworks" &&
                                    "border-orange-500 bg-red-800 text-white hover:bg-red-600"
                            )}
                            onClick={() => handleQuickFilter("most-artworks")}
                        >
                            Most Artworks
                        </Badge>
                        <Badge
                            variant="outline"
                            className={cn(
                                "cursor-pointer px-2 py-0.5 text-xs",
                                activeQuickFilter === "recent" &&
                                    "border-orange-500 bg-red-800 text-white hover:bg-red-600"
                            )}
                            onClick={() => handleQuickFilter("recent")}
                        >
                            Recently Added
                        </Badge>
                        <Badge
                            variant="outline"
                            className={cn(
                                "cursor-pointer px-2 py-0.5 text-xs",
                                activeQuickFilter === "popular" &&
                                    "border-orange-500 bg-orange-500 text-white hover:bg-red-600"
                            )}
                            onClick={() => handleQuickFilter("popular")}
                        >
                            Popular
                        </Badge>
                    </div>

                    {/* Filters Section */}
                    {showFilters && (
                        <div className="mb-4 border-gray-200 border-b pb-4">
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {/* Search */}
                                <div className="space-y-1.5">
                                    <label className="block font-medium text-gray-700 text-xs">
                                        Search Collections
                                    </label>
                                    <div className="relative">
                                        <Search className="-translate-y-1/2 absolute top-1/2 left-2.5 h-3.5 w-3.5 transform text-gray-400" />
                                        <Input
                                            placeholder="Search by name..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="h-8 pl-8 text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Sort By */}
                                <div className="space-y-1.5">
                                    <label className="block font-medium text-gray-700 text-xs">
                                        Sort By
                                    </label>
                                    <Select modal={false} value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="h-8 text-sm">
                                            <SelectValue placeholder="Sort by..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="newest">Newest First</SelectItem>
                                            <SelectItem value="oldest">Oldest First</SelectItem>
                                            <SelectItem value="most-artworks">
                                                Most Artworks
                                            </SelectItem>
                                            <SelectItem value="least-artworks">
                                                Least Artworks
                                            </SelectItem>
                                            <SelectItem value="popular">Most Popular</SelectItem>
                                            <SelectItem value="alphabetical">A-Z</SelectItem>
                                            <SelectItem value="alphabetical-desc">Z-A</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Artwork Count Range */}
                                <div className="space-y-1.5">
                                    <label className="block font-medium text-gray-700 text-xs">
                                        Artwork Count
                                    </label>
                                    <Select
                                        modal={false}
                                        value={artworkCountRange}
                                        onValueChange={setArtworkCountRange}
                                    >
                                        <SelectTrigger className="h-8 text-sm">
                                            <SelectValue placeholder="Artwork count..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="1-5">1 - 5 artworks</SelectItem>
                                            <SelectItem value="6-10">6 - 10 artworks</SelectItem>
                                            <SelectItem value="11-20">11 - 20 artworks</SelectItem>
                                            <SelectItem value="20+">20+ artworks</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}

                    {filteredCollections.length === 0 ? (
                        <EmptyState
                            icon={FolderOpen}
                            title="No Collections Found"
                            description="Try adjusting your filters to see more collections."
                        />
                    ) : (
                        <>
                            {viewMode === "grid" ? (
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {filteredCollections.map((collection) => (
                                        <CollectionGridCard
                                            key={collection.id}
                                            collection={collection}
                                            imageError={collectionImageErrors[collection.id]}
                                            onImageError={() =>
                                                setCollectionImageErrors((prev) => ({
                                                    ...prev,
                                                    [collection.id]: true
                                                }))
                                            }
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredCollections.map((collection) => (
                                        <CollectionListRow
                                            key={collection.id}
                                            collection={collection}
                                            imageError={collectionImageErrors[collection.id]}
                                            onImageError={() =>
                                                setCollectionImageErrors((prev) => ({
                                                    ...prev,
                                                    [collection.id]: true
                                                }))
                                            }
                                        />
                                    ))}
                                </div>
                            )}

                            {pagination.pages > 1 && (
                                <PaginationControls
                                    currentPage={pagination.page}
                                    totalPages={pagination.pages}
                                    onPageChange={setPage}
                                    totalItems={pagination.total}
                                    itemLabel="collections"
                                    itemLabelSingular="collection"
                                />
                            )}
                        </>
                    )}
                </section>

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
                                    Collections need at least 3 artworks to be published. Publish
                                    from the collection page once you’ve added enough.
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
            </div>
        </div>
    )
}
