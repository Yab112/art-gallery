import { ArtworkActions } from "@/components/artwork/artwork-actions"
import { ArtworkCollapsibles } from "@/components/artwork/artwork-collapsibles"
import { ArtworkCollectionManager } from "@/components/artwork/artwork-collection-manager"
import { ArtworkDetails } from "@/components/artwork/artwork-details"
import { ArtworkGalleryInfo } from "@/components/artwork/artwork-galleryInfo"
import { ArtworkImageGallery } from "@/components/artwork/artwork-image-gallery"
import { ArtworkOwnerPanel } from "@/components/artwork/artwork-owner-panel"
import { ArtworkPurchase } from "@/components/artwork/artwork-purchase"
import { MoreArtworksFromUser } from "@/components/artwork/more-artworks-from-user"
import { RelatedArtworks } from "@/components/artwork/related-artwork"
import { SimilarArtworks } from "@/components/artwork/similar-artworks"
import { UserBlogs } from "@/components/artwork/user-blogs"
import { CreateBlogModal } from "@/components/blog/create-blog-modal"
import { ArtworkDetailSkeleton } from "@/components/skeletons/artwork-detail-skeleton"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useArtwork } from "@/queries/artworkQueries"
import { useCartItems } from "@/queries/cartQueries"
import { useCheckFavorite } from "@/queries/favoriteQueries"
import { useAddToCart } from "@/services/cart/useAddToCart"
import { useAddFavorite } from "@/services/favorites/useAddFavorite"
import { useRemoveFavorite } from "@/services/favorites/useRemoveFavorite"
import type { Artwork } from "@/types/artwork.types"
import { ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { ArtworkAbout } from "../components/artwork/artwork-about"

export default function ArtworkDetailPage() {
    const { id } = useParams<{ id: string }>()
    const [isShippingOpen, setIsShippingOpen] = useState(false)
    const [isGuaranteeOpen, setIsGuaranteeOpen] = useState(false)

    const navigate = useNavigate()
    const { user } = useAuth()
    const isGuest = !user

    // Fetch artwork data
    const { data: artworkResponse, isLoading, error } = useArtwork(id || "")

    // Debug: Log the response to see what we're getting
    useEffect(() => {
        if (artworkResponse) {
            console.log("Artwork Response:", artworkResponse)
            console.log("Artwork Data:", artworkResponse?.artwork)
        }
    }, [artworkResponse])

    // Handle different response formats
    // Backend returns { success: true, artwork } or just artwork directly
    const artwork = artworkResponse?.artwork
        ? artworkResponse.artwork
        : artworkResponse && typeof artworkResponse === "object" && "id" in artworkResponse
          ? (artworkResponse as unknown as Artwork)
          : undefined

    // Check if artwork is favorited
    const { data: favoriteCheck } = useCheckFavorite(id || "")
    const isSaved = favoriteCheck?.isFavorite || false

    // Check if user is the owner
    const isOwner = artwork?.userId === user?.id

    // Mutations
    const { addFavorite } = useAddFavorite()
    const { removeFavorite } = useRemoveFavorite()
    const { addToCart, isAdding } = useAddToCart()

    // Check if artwork is already in cart (skip when guest — cart API requires auth; prevents 401 → login redirect on shared links)
    const { data: cartData } = useCartItems(1, 100, { enabled: !!user })
    const isInCart = cartData?.items?.some((item) => item.artworkId === id) || false

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    const handleSave = async () => {
        if (!id) return
        try {
            if (isSaved) {
                await removeFavorite(id)
            } else {
                await addFavorite(id)
            }
        } catch (error) {
            console.error("Failed to toggle favorite:", error)
        }
    }

    const handleAddToCart = async () => {
        if (!id) return
        try {
            await addToCart({ artworkId: id, quantity: 1 })
        } catch (error) {
            console.error("Failed to add to cart:", error)
        }
    }

    const handleShare = async () => {
        const url = `${window.location.origin}/artwork/${id}`
        try {
            await navigator.clipboard.writeText(url)
            toast.success("Link copied to clipboard!")
        } catch {
            toast.error("Failed to copy link")
        }
    }

    if (isLoading) {
        return <ArtworkDetailSkeleton />
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="px-4 text-center">
                    <p className="mb-1.5 font-semibold text-base text-red-600">
                        Failed to load artwork
                    </p>
                    <p className="mb-3 text-gray-600 text-sm">
                        {error instanceof Error ? error.message : "Please try again."}
                    </p>
                    <Button size="sm" onClick={() => window.location.reload()} className="text-xs">
                        Retry
                    </Button>
                </div>
            </div>
        )
    }

    if (!artwork || !artwork.id) {
        // Log for debugging
        console.log("Artwork Response:", artworkResponse)
        console.log("Artwork:", artwork)
        console.log("Is Loading:", isLoading)
        console.log("Error:", error)

        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="px-4 text-center">
                    <p className="mb-1.5 font-semibold text-base text-red-600">Artwork not found</p>
                    <p className="mb-3 text-gray-600 text-sm">
                        This artwork doesn't exist or has been removed.
                    </p>
                    <Button size="sm" onClick={() => navigate("/buyart")} className="text-xs">
                        Browse Artworks
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="border-gray-200 border-b bg-white">
                <div className="container mx-auto px-4 py-2">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 text-gray-600 text-sm transition-colors hover:text-gray-900"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>{artwork.artist || artwork.user?.name || "Artist"}</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 py-4">
                <div className="mx-auto max-w-7xl">
                    {isOwner ? (
                        // Owner View - Two Column Layout with Owner Panel
                        <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
                            {/* Left Column - Artwork Image & Actions */}
                            <div className="space-y-3 lg:col-span-2">
                                <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
                                    {/* Left Column - Artwork Image */}
                                    <div className="space-y-3">
                                        <ArtworkImageGallery
                                            photos={artwork.photos || []}
                                            alt={`${artwork.title || "Untitled"} by ${artwork.artist}`}
                                        />
                                        <ArtworkActions
                                            isSaved={isSaved}
                                            onSave={handleSave}
                                            onShare={handleShare}
                                        />
                                        {user && <ArtworkCollectionManager artworkId={id || ""} />}
                                    </div>
                                    {/* Right Column - Artwork Details */}
                                    <div className="space-y-3">
                                        <ArtworkDetails artwork={artwork} />
                                        <ArtworkPurchase
                                            artwork={artwork}
                                            onAddToCart={handleAddToCart}
                                            isOwner={isOwner}
                                            isAdding={isAdding}
                                            isInCart={isInCart}
                                        />
                                        <ArtworkCollapsibles
                                            artwork={artwork}
                                            isShippingOpen={isShippingOpen}
                                            setIsShippingOpen={setIsShippingOpen}
                                            isGuaranteeOpen={isGuaranteeOpen}
                                            setIsGuaranteeOpen={setIsGuaranteeOpen}
                                        />
                                        <ArtworkGalleryInfo artwork={artwork} isOwner={isOwner} />
                                    </div>
                                </div>
                                {!isGuest && <ArtworkAbout artwork={artwork} isOwner={isOwner} />}
                                <RelatedArtworks
                                    artworkId={id || ""}
                                    artist={artwork.artist}
                                    categoryIds={artwork.categories}
                                />
                                <SimilarArtworks artworkId={id || ""} />
                                {artwork.userId && (
                                    <>
                                        <div className="mb-4 flex items-center justify-between">
                                            <h3 className="font-semibold text-lg">Blog Posts</h3>
                                            {user && artwork.userId === user.id && (
                                                <CreateBlogModal />
                                            )}
                                        </div>
                                        <UserBlogs userId={artwork.userId} />
                                    </>
                                )}
                            </div>
                            {/* Right Column - Owner Panel */}
                            <div className="lg:col-span-1">
                                <ArtworkOwnerPanel artwork={artwork} />
                            </div>
                        </div>
                    ) : (
                        // Public View - Standard Layout
                        <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
                            {/* Left Column - Artwork Image */}
                            <div className="space-y-3">
                                <ArtworkImageGallery
                                    photos={artwork.photos || []}
                                    alt={`${artwork.title || "Untitled"} by ${artwork.artist}`}
                                />
                                <ArtworkActions
                                    isSaved={isSaved}
                                    onSave={handleSave}
                                    isGuest={isGuest}
                                    onShare={handleShare}
                                />
                                {user && <ArtworkCollectionManager artworkId={id || ""} />}
                            </div>
                            {/* Right Column - Artwork Details */}
                            <div className="space-y-3">
                                <ArtworkDetails artwork={artwork} />
                                <ArtworkPurchase
                                    artwork={artwork}
                                    onAddToCart={handleAddToCart}
                                    isOwner={isOwner}
                                    isAdding={isAdding}
                                    isInCart={isInCart}
                                    isGuest={isGuest}
                                />
                                {!isGuest && (
                                    <ArtworkCollapsibles
                                        artwork={artwork}
                                        isShippingOpen={isShippingOpen}
                                        setIsShippingOpen={setIsShippingOpen}
                                        isGuaranteeOpen={isGuaranteeOpen}
                                        setIsGuaranteeOpen={setIsGuaranteeOpen}
                                    />
                                )}
                                <ArtworkGalleryInfo artwork={artwork} isOwner={isOwner} />
                            </div>
                        </div>
                    )}
                    {!isOwner && (
                        <div className="mt-4 space-y-3">
                            {!isGuest && <ArtworkAbout artwork={artwork} isOwner={isOwner} />}
                            <RelatedArtworks
                                artworkId={id || ""}
                                artist={artwork.artist}
                                categoryIds={artwork.categories}
                            />
                            <SimilarArtworks artworkId={id || ""} />
                            {!isGuest && artwork.userId && (
                                <>
                                    <div className="mt-8 mb-4 flex items-center justify-between">
                                        <h3 className="font-semibold text-lg">
                                            Blog Posts by This Artist
                                        </h3>
                                        {user && artwork.userId === user.id && <CreateBlogModal />}
                                    </div>
                                    <UserBlogs userId={artwork.userId} />
                                    <MoreArtworksFromUser
                                        userId={artwork.userId}
                                        currentArtworkId={id || ""}
                                    />
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
