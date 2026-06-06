import { ArtworkGrid } from "@/components/ArtMarketplace/artwork-grid"
import { ArtworkMasonrySkeleton } from "@/components/ArtMarketplace/artwork-masonry-grid"
import { MarketplaceHero } from "@/components/ArtMarketplace/hero-section"
import { SearchFilters } from "@/components/ArtMarketplace/search-filters"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useArtworksInfinite } from "@/queries/artworkQueries"
import type { ArtworkQueryParams } from "@/types/artwork.types"
import { collectionKeys } from "@/queries/queryKeys"
import { useGetCategories } from "@/services/category/useGetCategories"
import { useAddArtworkToCollection } from "@/services/collections/useAddArtworkToCollection"
import { useAddFavorite } from "@/services/favorites/useAddFavorite"
import { useQueryClient } from "@tanstack/react-query"
import { CheckSquare, Grid, List, Loader2, SlidersHorizontal } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"

export default function ArtMarketplace() {
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()
    const artworksSectionRef = useRef<HTMLDivElement>(null)
    const loadMoreRef = useRef<HTMLDivElement>(null)
    const { user } = useAuth()

    // Check if we're in "add to collection" mode (guests cannot use it)
    const collectionId = searchParams.get("addToCollection")
    const isSelectionMode = !!user && !!collectionId

    // Selection state
    const [selectedArtworkIds, setSelectedArtworkIds] = useState<Set<string>>(new Set())
    const [filtersOpen, setFiltersOpen] = useState(false)

    // Collection operations
    const { addArtwork, isAdding } = useAddArtworkToCollection()
    const queryClient = useQueryClient()

    // Get filter values from URL query params, with defaults
    const viewMode = (searchParams.get("view") || "grid") as "grid" | "list"
    const searchQuery = searchParams.get("search") || ""
    const sortBy = searchParams.get("sort") || "recommended"
    const priceRange = searchParams.get("priceRange") || "price"
    const mediumParam = searchParams.get("medium") || ""
    const medium = mediumParam ? mediumParam.split(",") : []
    const originParam = searchParams.get("origin") || ""
    const origin = originParam ? originParam.split(",") : []
    const conditionParam = searchParams.get("condition") || ""
    const condition = conditionParam ? conditionParam.split(",") : []

    // Get category from URL - can be slug (from mega menu) or IDs (from filters)
    const categorySlug = searchParams.get("category") || ""
    const categoryParam = searchParams.get("categories") || ""
    const selectedCategoryIds = categoryParam
        ? categoryParam.split(",").filter((id) => id.trim() !== "")
        : []

    const hasActiveFilters =
        searchQuery !== "" ||
        priceRange !== "price" ||
        medium.length > 0 ||
        origin.length > 0 ||
        condition.length > 0 ||
        selectedCategoryIds.length > 0

    // Update URL query params
    const updateSearchParams = (updates: Record<string, string | number | string[] | null>) => {
        const newParams = new URLSearchParams(searchParams)
        Object.entries(updates).forEach(([key, value]) => {
            if (
                value === null ||
                value === "" ||
                (Array.isArray(value) && value.length === 0) ||
                value === "price" ||
                (typeof value === "string" && (value === "medium" || value === "origin" || value === "condition"))
            ) {
                newParams.delete(key)
            } else if (Array.isArray(value)) {
                // For arrays, join with comma
                newParams.set(key, value.join(","))
            } else {
                newParams.set(key, String(value))
            }
        })
        setSearchParams(newParams, { replace: true })
    }

    const setViewMode = (mode: "grid" | "list") => {
        updateSearchParams({ view: mode })
    }

    const setSearchQuery = (query: string) => {
        updateSearchParams({ search: query || null, categories: [] })
    }

    const setSortBy = (value: string) => {
        updateSearchParams({ sort: value })
    }

    const setPriceRange = (value: string) => {
        updateSearchParams({
            priceRange: value === "price" ? null : value,
        })
    }

    const setMedium = (values: string[]) => {
        updateSearchParams({ medium: values.length > 0 ? values : null })
    }

    const setOrigin = (values: string[]) => {
        updateSearchParams({ origin: values.length > 0 ? values : null })
    }

    const setCondition = (values: string[]) => {
        updateSearchParams({ condition: values.length > 0 ? values : null })
    }

    const setCategoryIds = (ids: string[]) => {
        updateSearchParams({ categories: ids.length > 0 ? ids : null })
    }

    const clearAllFilters = () => {
        setSearchParams(new URLSearchParams(), { replace: true })
    }

    // Fetch categories from backend
    const { data: categoriesData, isLoading: isLoadingCategories } = useGetCategories()

    // Transform categories to CategoryGrid format
    const categories = (categoriesData || []).map((category) => ({
        id: category.id,
        name: category.name,
        image: category.image || "/placeholder.svg",
        count: (category.artworkCount || 0).toLocaleString()
    }))

    // Strip addToCollection for guests — they must sign in to add to collection
    useEffect(() => {
        if (!user && collectionId) {
            const next = new URLSearchParams(searchParams)
            next.delete("addToCollection")
            setSearchParams(next, { replace: true })
        }
    }, [user, collectionId, searchParams, setSearchParams])

    // Convert category slug to category ID if category slug is provided (from mega menu)
    useEffect(() => {
        if (categorySlug && categoriesData && categoriesData.length > 0) {
            const category = categoriesData.find((cat) => cat.slug === categorySlug)
            if (category && !selectedCategoryIds.includes(category.id)) {
                // Update URL to use category ID instead of slug
                updateSearchParams({
                    category: null,
                    categories: [category.id],
                })
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categorySlug, categoriesData])

    const artworkQueryParams = useMemo(() => {
        const params: Record<string, unknown> = {
            limit: 12,
        }

        if (selectedCategoryIds.length > 0) {
            params.categoryIds = selectedCategoryIds
        }

        if (searchQuery) {
            params.search = searchQuery
        }

        switch (sortBy) {
            case "price-low":
                params.sortBy = "desiredPrice"
                params.orderBy = "asc"
                break
            case "price-high":
                params.sortBy = "desiredPrice"
                params.orderBy = "desc"
                break
            case "newest":
                params.sortBy = "createdAt"
                params.orderBy = "desc"
                break
            case "oldest":
                params.sortBy = "createdAt"
                params.orderBy = "asc"
                break
            case "recommended":
            default:
                params.sortBy = "createdAt"
                params.orderBy = "desc"
                break
        }

        switch (priceRange) {
            case "under-1k":
                params.maxPrice = 1000
                break
            case "1k-10k":
                params.minPrice = 1000
                params.maxPrice = 10000
                break
            case "10k-50k":
                params.minPrice = 10000
                params.maxPrice = 50000
                break
            case "over-50k":
                params.minPrice = 50000
                break
        }

        if (medium.length > 0) {
            params.support = medium
        }

        if (origin.length > 0) {
            params.origin = origin
        }

        if (condition.length > 0) {
            params.state = condition
        }

        return params
    }, [
        selectedCategoryIds,
        searchQuery,
        sortBy,
        priceRange,
        medium,
        origin,
        condition,
    ])

    const {
        data: artworksPages,
        isLoading: isLoadingArtworks,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        error: artworksError,
    } = useArtworksInfinite(artworkQueryParams as ArtworkQueryParams)

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage()
                }
            },
            { threshold: 0.1 },
        )

        const target = loadMoreRef.current
        if (target) {
            observer.observe(target)
        }

        return () => observer.disconnect()
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    const artworksData = artworksPages?.pages[0]
    const isLoading = isLoadingArtworks
    const error = artworksError

    const { addFavorite } = useAddFavorite()

    const handleFavorite = async (id: string) => {
        try {
            // For now, just add to favorites. You can check if favorited first using useCheckFavorite
            await addFavorite(id)
        } catch (error) {
            // Error is handled by the mutation hook (toast)
            console.error("Failed to toggle favorite:", error)
        }
    }

    const handleToggleSelection = (artworkId: string) => {
        setSelectedArtworkIds((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(artworkId)) {
                newSet.delete(artworkId)
            } else {
                newSet.add(artworkId)
            }
            return newSet
        })
    }

    const handleAddToCollection = async () => {
        if (!collectionId || selectedArtworkIds.size === 0) {
            toast.error("Please select at least one artwork")
            return
        }

        try {
            // Add all selected artworks to the collection
            const promises = Array.from(selectedArtworkIds).map((artworkId) =>
                addArtwork(collectionId, artworkId)
            )

            await Promise.all(promises)

            // Invalidate collection queries
            queryClient.invalidateQueries({ queryKey: collectionKeys.detail(collectionId) })
            queryClient.invalidateQueries({ queryKey: collectionKeys.lists() })

            toast.success(`Added ${selectedArtworkIds.size} artwork(s) to collection`)

            // Redirect back to collection detail page
            navigate(`/collections/${collectionId}`)
        } catch (error: any) {
            console.error("Failed to add artworks to collection:", error)
            toast.error("Failed to add some artworks to the collection")
        }
    }

    const handleCategorySelect = (categoryId: string) => {
        // Toggle category selection - add if not selected, remove if already selected
        const newSelectedIds = selectedCategoryIds.includes(categoryId)
            ? selectedCategoryIds.filter((id) => id !== categoryId)
            : [...selectedCategoryIds, categoryId]

        updateSearchParams({ categories: newSelectedIds })

        // Scroll to artworks section if a category is selected (user-initiated)
        if (newSelectedIds.length > 0 && artworksSectionRef.current) {
            requestAnimationFrame(() => {
                if (artworksSectionRef.current) {
                    const elementPosition = artworksSectionRef.current.getBoundingClientRect().top
                    const offsetPosition = elementPosition + window.pageYOffset - 20 // 20px offset from top
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    })
                }
            })
        }
    }

    // Transform backend data to match component props
    const artworks = useMemo(() => {
        const seen = new Set<string>()
        const rawArtworks =
            artworksPages?.pages.flatMap((page) => page.artworks ?? []) ?? []

        return rawArtworks
            .filter((artwork) => {
                if (seen.has(artwork.id)) return false
                seen.add(artwork.id)
                return true
            })
            .map((artwork) => {
                const firstPhoto = artwork.photos?.[0]
                const imageUrl =
                    firstPhoto && typeof firstPhoto === "string" && firstPhoto.trim() !== ""
                        ? firstPhoto
                        : null

                return {
                    id: artwork.id,
                    image: imageUrl || "",
                    title: artwork.title || "Untitled",
                    artist: artwork.artist,
                    price: `US$${artwork.desiredPrice?.toLocaleString() || "0"}`,
                    year: artwork.yearOfArtwork,
                    medium: artwork.support,
                    dimensions: artwork.dimensions
                        ? `${artwork.dimensions.width} × ${artwork.dimensions.height} in`
                        : "N/A",
                    physicalWidth: artwork.dimensions?.width,
                    physicalHeight: artwork.dimensions?.height,
                    seller: artwork.user?.name || "Unknown",
                    status: artwork.status,
                }
            })
    }, [artworksPages])

    return (
        <div className="min-h-screen bg-white">
            <MarketplaceHero
                eyebrow="Art marketplace"
                title="Explore original art"
                subtitle="Paintings, photography, and more from artists and collectors worldwide."
                buttonText="Browse collections"
                onButtonClick={() => navigate("/collections")}
                categories={categories}
                onCategorySelect={handleCategorySelect}
                selectedCategoryIds={selectedCategoryIds}
                isLoadingCategories={isLoadingCategories}
            />

            <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4">
                <div className="flex flex-col gap-4 lg:flex-row">
                    <SearchFilters
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        artworkCount={artworksData?.total || 0}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        priceRange={priceRange}
                        onPriceRangeChange={setPriceRange}
                        medium={medium}
                        onMediumChange={setMedium}
                        origin={origin}
                        onOriginChange={setOrigin}
                        condition={condition}
                        onConditionChange={setCondition}
                        categoryIds={selectedCategoryIds}
                        onCategoryIdsChange={setCategoryIds}
                        categoriesData={categoriesData}
                        onClearAll={clearAllFilters}
                        isOpen={filtersOpen}
                        onClose={() => setFiltersOpen(false)}
                    />

                    <div className="min-w-0 flex-1">
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="font-semibold text-gray-900 text-base sm:text-lg">
                                Artworks
                                <span className="mx-2 font-normal text-gray-300">·</span>
                                <span className="font-normal text-gray-500 text-sm sm:text-base">
                                    {artworksData?.total || 0}{" "}
                                    {artworksData?.total === 1 ? "result" : "results"}
                                </span>
                            </p>

                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={`h-9 rounded-full border-gray-200 px-3 text-sm ${
                                        filtersOpen ? "border-red-200 bg-red-50 text-red-700" : ""
                                    }`}
                                    onClick={() => setFiltersOpen((open) => !open)}
                                >
                                    <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
                                    Filters
                                    {hasActiveFilters && (
                                        <span className="ml-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] text-white">
                                            !
                                        </span>
                                    )}
                                </Button>

                                <Select
                                    value={sortBy}
                                    onValueChange={setSortBy}
                                    {...({ modal: false } as any)}
                                >
                                    <SelectTrigger className="h-9 w-40 rounded-full border-gray-200 bg-white px-3 text-sm focus:ring-2 focus:ring-red-100">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" sideOffset={4} className="z-[100]">
                                        <SelectItem value="recommended">Recommended</SelectItem>
                                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                                        <SelectItem value="newest">Newest First</SelectItem>
                                        <SelectItem value="oldest">Oldest First</SelectItem>
                                    </SelectContent>
                                </Select>

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

                        {/* SELECTION MODE BANNER */}
                        {isSelectionMode && (
                            <div className="mb-6 rounded-2xl border-blue-200 border bg-blue-50/50 p-4 backdrop-blur-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <CheckSquare className="h-5 w-5 text-blue-600" />
                                        <span className="font-semibold text-blue-900 text-sm">
                                            {selectedArtworkIds.size} selected
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                const newParams = new URLSearchParams(searchParams)
                                                newParams.delete("addToCollection")
                                                setSearchParams(newParams)
                                                setSelectedArtworkIds(new Set())
                                            }}
                                            className="text-blue-700 hover:bg-blue-100"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={handleAddToCollection}
                                            disabled={selectedArtworkIds.size === 0 || isAdding}
                                            className="bg-blue-600 text-white hover:bg-blue-700"
                                        >
                                            {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Add to Collection
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={artworksSectionRef} className="min-h-[480px]">
                            {isLoading ? (
                                <ArtworkMasonrySkeleton />
                            ) : error ? (
                                <div className="flex h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50/30 text-center">
                                    <p className="font-medium text-gray-900">Something went wrong</p>
                                    <p className="mt-1 text-gray-500 text-sm">Failed to load artworks. Please refresh.</p>
                                    <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                                        Retry
                                    </Button>
                                </div>
                            ) : artworks.length > 0 ? (
                                <ArtworkGrid
                                    artworks={artworks}
                                    viewMode={viewMode}
                                    onFavorite={handleFavorite}
                                    isSelectionMode={isSelectionMode}
                                    selectedArtworkIds={selectedArtworkIds}
                                    onToggleSelection={handleToggleSelection}
                                    infiniteScroll={{
                                        loadMoreRef,
                                        isFetchingNextPage,
                                        hasNextPage: !!hasNextPage,
                                    }}
                                />
                            ) : (
                                <div className="flex h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50/30 text-center">
                                    <p className="font-medium text-gray-900">No artworks found</p>
                                    <p className="mt-1 text-gray-500 text-sm">Try adjusting your filters or search terms.</p>
                                    {hasActiveFilters && (
                                        <Button variant="link" className="mt-2 text-red-600" onClick={clearAllFilters}>
                                            Clear all filters
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
