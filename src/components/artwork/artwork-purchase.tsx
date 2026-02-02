import { Button } from "@/components/ui/button"
import type { Artwork } from "@/types/artwork.types"
import { CheckCircle2, Loader2 } from "lucide-react"
import { Link } from "react-router-dom"

interface ArtworkPurchaseProps {
    artwork: Artwork
    onAddToCart?: () => void
    isOwner?: boolean
    isAdding?: boolean
    isInCart?: boolean
    isGuest?: boolean
}

export const ArtworkPurchase = ({
    artwork,
    onAddToCart,
    isOwner = false,
    isAdding = false,
    isInCart = false,
    isGuest = false
}: ArtworkPurchaseProps) => {
    const price = artwork.desiredPrice
        ? `US$${artwork.desiredPrice.toLocaleString()}`
        : "Price on request"

    const isSold = artwork.status === "SOLD"

    // Don't show purchase options if user is the owner
    if (isOwner) {
        return (
            <div className="space-y-2">
                <div className="font-semibold text-2xl text-gray-900">{price}</div>
                <div className="rounded-md border border-gray-200 bg-gray-50 p-2.5 text-gray-600 text-xs">
                    This is your artwork. You can manage it using the actions panel on the right.
                </div>
            </div>
        )
    }

    // Show sold message if artwork is sold
    if (isSold) {
        return (
            <div className="space-y-2">
                <div className="font-semibold text-2xl text-gray-900">{price}</div>
                <div className="rounded-md border border-gray-300 bg-gray-100 p-3 text-gray-700 text-sm">
                    <p className="mb-1 font-medium">This artwork has been sold</p>
                    <p className="text-gray-600 text-xs">
                        This item is no longer available for purchase.
                    </p>
                </div>
                <Button
                    className="h-9 w-full cursor-not-allowed rounded-full bg-gray-400 text-sm text-white hover:bg-gray-400"
                    disabled
                >
                    Sold Out
                </Button>
            </div>
        )
    }

    // Guest: price + Sign in to buy
    if (isGuest) {
        const redirect = `/artwork/${artwork.id}`
        return (
            <div className="space-y-2">
                <div className="font-semibold text-2xl text-gray-900">{price}</div>
                <Button
                    className="h-9 w-full rounded-full bg-red-700 text-sm text-white hover:bg-red-800"
                    asChild
                >
                    <Link to={`/login?redirect=${encodeURIComponent(redirect)}`}>
                        Sign in to buy
                    </Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            <div className="font-semibold text-2xl text-gray-900">{price}</div>
            <div className="space-y-2">
                {isInCart ? (
                    <div className="rounded-md border border-green-200 bg-green-50 p-3">
                        <div className="flex items-center gap-2 text-green-800 text-sm">
                            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                            <span className="font-medium">This item is already in your cart</span>
                        </div>
                    </div>
                ) : (
                    <Button
                        className="h-9 w-full rounded-full bg-red-700 text-sm text-white hover:bg-red-800"
                        onClick={onAddToCart}
                        disabled={isAdding}
                    >
                        {isAdding ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Adding...
                            </>
                        ) : (
                            "Add to Cart"
                        )}
                    </Button>
                )}
            </div>
        </div>
    )
}
