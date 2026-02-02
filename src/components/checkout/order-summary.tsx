import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useCheckout } from "@/contexts/CheckoutContext"
import { useCartItems } from "@/queries/cartQueries"
import { useRemoveFromCart } from "@/services/cart/useRemoveFromCart"
import { Trash2 } from "lucide-react"
import { useEffect } from "react"

export function OrderSummary() {
    // Fetch cart data from backend
    const { data: cartData, isLoading } = useCartItems(1, 50)
    const { removeFromCart, isRemoving } = useRemoveFromCart()
    const { selectedCartItemIds, setSelectedCartItemIds } = useCheckout()

    const cartItems = cartData?.items || []

    // Initialize: Select all items by default when cart loads or when new items are added
    useEffect(() => {
        if (cartItems.length > 0) {
            const currentItemIds = new Set(cartItems.map((item) => item.id))

            // If no items are selected, select all
            if (selectedCartItemIds.size === 0) {
                setSelectedCartItemIds(currentItemIds)
            } else {
                // If new items were added, add them to selection
                const newItemIds = cartItems
                    .filter((item) => !selectedCartItemIds.has(item.id))
                    .map((item) => item.id)

                if (newItemIds.length > 0) {
                    setSelectedCartItemIds((prev) => {
                        const newSet = new Set(prev)
                        newItemIds.forEach((id) => newSet.add(id))
                        return newSet
                    })
                }

                // Remove items that no longer exist in cart
                const removedItemIds = Array.from(selectedCartItemIds).filter(
                    (id) => !currentItemIds.has(id)
                )

                if (removedItemIds.length > 0) {
                    setSelectedCartItemIds((prev) => {
                        const newSet = new Set(prev)
                        removedItemIds.forEach((id) => newSet.delete(id))
                        return newSet
                    })
                }
            }
        } else {
            // Clear selection if cart is empty
            if (selectedCartItemIds.size > 0) {
                setSelectedCartItemIds(new Set())
            }
        }
    }, [cartItems, setSelectedCartItemIds])

    // Get selected items (exclude sold or non-approved artworks)
    const selectedItems = cartItems.filter((item) => {
        const isSelected = selectedCartItemIds.has(item.id)
        const isSold = item.artwork?.status === "SOLD"
        const isNotApproved = item.artwork?.status !== "APPROVED"
        return isSelected && !isSold && !isNotApproved
    })

    // Calculate subtotal from SELECTED items only
    const subtotal = selectedItems.reduce((sum, item) => {
        const price = Number(item.artwork?.desiredPrice) || 0
        return sum + price * item.quantity
    }, 0)

    // Total is now just the subtotal (inclusive of platform fee)
    const total = subtotal

    const handleToggleItem = (itemId: string) => {
        setSelectedCartItemIds((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(itemId)) {
                newSet.delete(itemId)
            } else {
                newSet.add(itemId)
            }
            return newSet
        })
    }

    const handleSelectAll = () => {
        const allIds = new Set(cartItems.map((item) => item.id))
        setSelectedCartItemIds(allIds)
    }

    const handleDeselectAll = () => {
        setSelectedCartItemIds(new Set())
    }

    const allSelected = cartItems.length > 0 && selectedItems.length === cartItems.length

    const handleRemove = async (artworkId: string) => {
        try {
            // Find the cart item to get its ID
            const itemToRemove = cartItems.find((item) => item.artworkId === artworkId)
            if (itemToRemove) {
                // Remove from selection if it was selected
                setSelectedCartItemIds((prev) => {
                    const newSet = new Set(prev)
                    newSet.delete(itemToRemove.id)
                    return newSet
                })
            }
            await removeFromCart(artworkId)
        } catch (error) {
            console.error("Failed to remove from cart:", error)
        }
    }

    return (
        <div className="sticky top-6 rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold text-base text-gray-900">Order Summary</h2>
                {cartItems.length > 0 && (
                    <button
                        onClick={allSelected ? handleDeselectAll : handleSelectAll}
                        className="text-gray-600 text-xs hover:text-gray-900"
                    >
                        {allSelected ? "Deselect All" : "Select All"}
                    </button>
                )}
            </div>

            {/* Cart Items */}
            <div className="mb-4 max-h-[300px] space-y-2 overflow-y-auto">
                {isLoading ? (
                    <p className="py-4 text-center text-gray-500 text-xs">Loading...</p>
                ) : cartItems.length === 0 ? (
                    <p className="py-4 text-center text-gray-500 text-xs">Cart is empty</p>
                ) : (
                    cartItems.map((item) => {
                        const isSelected = selectedCartItemIds.has(item.id)
                        const isSold = item.artwork?.status === "SOLD"
                        const isNotApproved = item.artwork?.status !== "APPROVED"
                        const isDisabled = isSold || isNotApproved

                        return (
                            <div
                                key={item.id}
                                className={`flex gap-2 rounded border p-2 ${
                                    isSelected && !isDisabled ? "border-red-300" : "border-gray-200"
                                } ${isDisabled ? "bg-gray-50 opacity-60" : ""}`}
                            >
                                <div className="flex-shrink-0 pt-0.5">
                                    <Checkbox
                                        checked={isSelected && !isDisabled}
                                        disabled={isDisabled}
                                        onCheckedChange={() =>
                                            !isDisabled && handleToggleItem(item.id)
                                        }
                                        className="h-3.5 w-3.5"
                                    />
                                </div>
                                <img
                                    src={item.artwork?.photos?.[0] || "/placeholder.svg"}
                                    alt={item.artwork?.title || "Artwork"}
                                    className="h-12 w-12 rounded border border-gray-200 object-cover"
                                />
                                <div className="min-w-0 flex-1">
                                    <h3 className="line-clamp-1 font-medium text-gray-900 text-xs">
                                        {item.artwork?.title || "Untitled"}
                                    </h3>
                                    <p className="text-gray-500 text-xs">
                                        {item.artwork?.artist || "Unknown"}
                                    </p>
                                    {isDisabled && (
                                        <p className="mt-0.5 font-medium text-red-600 text-xs">
                                            {isSold
                                                ? "Sold - Cannot purchase"
                                                : "Not available for purchase"}
                                        </p>
                                    )}
                                    <div className="mt-1 flex items-center justify-between">
                                        <span className="text-gray-600 text-xs">
                                            Qty: {item.quantity}
                                        </span>
                                        <span className="font-medium text-gray-900 text-xs">
                                            $
                                            {(
                                                (Number(item.artwork?.desiredPrice) || 0) *
                                                item.quantity
                                            ).toLocaleString("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 text-red-600 hover:bg-red-50"
                                    onClick={() => handleRemove(item.artworkId)}
                                    disabled={isRemoving}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Selection Info */}
            {cartItems.length > 0 && selectedItems.length === 0 && (
                <div className="mb-3 border-yellow-200 border-b pb-3">
                    <p className="text-xs text-yellow-700">No items selected</p>
                </div>
            )}

            {/* Price Breakdown — Subtotal and Total are now the same (inclusive of fees) */}
            {selectedItems.length > 0 && (
                <div className="mb-4 space-y-1.5">
                    <div className="flex justify-between py-1 text-xs">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-gray-900">
                            $
                            {subtotal.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                        </span>
                    </div>

                    <div className="mt-2 border-gray-200 border-t pt-2">
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-900 text-sm">Total</span>
                            <span className="font-semibold text-base text-gray-900">
                                $
                                {total.toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Security Note */}
            <div className="border-gray-200 border-t pt-3">
                <p className="text-gray-500 text-xs">Secure checkout • 30-day guarantee</p>
            </div>
        </div>
    )
}
