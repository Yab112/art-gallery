import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useCheckout } from "@/contexts/CheckoutContext"
import { formatMoney } from "@/lib/format-money"
import { groupCartItemsBySeller } from "@/lib/checkout-sellers"
import { useCartItems } from "@/queries/cartQueries"
import { useRemoveFromCart } from "@/services/cart/useRemoveFromCart"
import { Trash2 } from "lucide-react"
import { useEffect, useMemo } from "react"

function formatCheckoutDimensions(dimensions: unknown): string | null {
    if (!dimensions || typeof dimensions !== "object") return null
    const d = dimensions as { width?: unknown; height?: unknown; depth?: unknown }
    const width = d.width != null && String(d.width).trim() !== "" ? String(d.width) : null
    const height = d.height != null && String(d.height).trim() !== "" ? String(d.height) : null
    if (!width || !height) return null
    const depth = d.depth != null && String(d.depth).trim() !== "" ? String(d.depth) : null
    return depth ? `${width} × ${height} × ${depth} cm` : `${width} × ${height} cm`
}

function formatCheckoutWeight(weight: unknown): string | null {
    if (weight == null) return null
    const raw = String(weight).trim()
    if (!raw) return null
    return /kg|lb|g\b/i.test(raw) ? raw : `${raw} kg`
}

export function OrderSummary() {
    const { data: cartData, isLoading } = useCartItems(1, 50)
    const { removeFromCart, isRemoving } = useRemoveFromCart()
    const {
        selectedCartItemIds,
        setSelectedCartItemIds,
        sellerCheckouts,
    } = useCheckout()

    const cartItems = cartData?.items || []

    useEffect(() => {
        if (cartItems.length > 0) {
            const currentItemIds = new Set(cartItems.map((item) => item.id))

            if (selectedCartItemIds.size === 0) {
                setSelectedCartItemIds(currentItemIds)
            } else {
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

                const removedItemIds = Array.from(selectedCartItemIds).filter(
                    (id) => !currentItemIds.has(id),
                )

                if (removedItemIds.length > 0) {
                    setSelectedCartItemIds((prev) => {
                        const newSet = new Set(prev)
                        removedItemIds.forEach((id) => newSet.delete(id))
                        return newSet
                    })
                }
            }
        } else if (selectedCartItemIds.size > 0) {
            setSelectedCartItemIds(new Set())
        }
    }, [cartItems, setSelectedCartItemIds])

    const selectedItems = cartItems.filter((item) => {
        const isSelected = selectedCartItemIds.has(item.id)
        const isSold = item.artwork?.status === "SOLD"
        const isNotApproved = item.artwork?.status !== "APPROVED"
        return isSelected && !isSold && !isNotApproved
    })

    const sellerGroups = useMemo(
        () => groupCartItemsBySeller(selectedItems),
        [selectedItems],
    )

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
        setSelectedCartItemIds(new Set(cartItems.map((item) => item.id)))
    }

    const handleDeselectAll = () => {
        setSelectedCartItemIds(new Set())
    }

    const allSelected = cartItems.length > 0 && selectedItems.length === cartItems.length

    const handleRemove = async (artworkId: string) => {
        try {
            const itemToRemove = cartItems.find((item) => item.artworkId === artworkId)
            if (itemToRemove) {
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
        <aside className="overflow-hidden border border-stone-200/80 bg-white/80 font-poppins backdrop-blur-sm">
            <div className="border-b border-stone-200/80 bg-gradient-to-br from-stone-100 via-white to-red-50/40 px-5 py-4">
                <div className="flex items-end justify-between gap-3">
                    <div>
                        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-stone-500">
                            Your bag
                        </p>
                        <h2 className="mt-1 font-lexend text-lg font-semibold tracking-tight text-stone-900">
                            Order summary
                        </h2>
                    </div>
                    {cartItems.length > 0 && (
                        <button
                            type="button"
                            onClick={allSelected ? handleDeselectAll : handleSelectAll}
                            className="text-[11px] font-medium text-stone-500 underline-offset-2 transition hover:text-red-800 hover:underline"
                        >
                            {allSelected ? "Deselect all" : "Select all"}
                        </button>
                    )}
                </div>
            </div>

            <div className="max-h-[420px] space-y-0 overflow-y-auto px-2 py-1">
                {isLoading ? (
                    <p className="px-3 py-8 text-center text-xs text-stone-500">Loading…</p>
                ) : cartItems.length === 0 ? (
                    <p className="px-3 py-8 text-center text-xs text-stone-500">Cart is empty</p>
                ) : (
                    cartItems.map((item) => {
                        const isSelected = selectedCartItemIds.has(item.id)
                        const isSold = item.artwork?.status === "SOLD"
                        const isNotApproved = item.artwork?.status !== "APPROVED"
                        const isDisabled = isSold || isNotApproved
                        const dimensions = formatCheckoutDimensions(item.artwork?.dimensions)
                        const weight = formatCheckoutWeight(item.artwork?.weight)
                        const support = item.artwork?.support?.trim() || null
                        const year = item.artwork?.yearOfArtwork?.trim() || null
                        const framedLabel =
                            typeof item.artwork?.isFramed === "boolean"
                                ? item.artwork.isFramed
                                    ? "Framed"
                                    : "Unframed"
                                : null
                        const metaParts = [dimensions, weight, support, framedLabel, year].filter(
                            Boolean,
                        )
                        const currency = "USD" as const

                        return (
                            <div
                                key={item.id}
                                className={`flex gap-3 border-b border-stone-100 px-3 py-3 transition-colors ${
                                    isSelected && !isDisabled ? "bg-red-50/40" : ""
                                } ${isDisabled ? "opacity-50" : ""}`}
                            >
                                <div className="flex-shrink-0 pt-1">
                                    <Checkbox
                                        checked={isSelected && !isDisabled}
                                        disabled={isDisabled}
                                        onCheckedChange={() =>
                                            !isDisabled && handleToggleItem(item.id)
                                        }
                                        className="h-3.5 w-3.5 border-stone-400 data-[state=checked]:border-red-700 data-[state=checked]:bg-red-700"
                                    />
                                </div>
                                <div className="relative h-16 w-14 flex-shrink-0 overflow-hidden bg-stone-100">
                                    <img
                                        src={item.artwork?.photos?.[0] || "/placeholder.svg"}
                                        alt={item.artwork?.title || "Artwork"}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="line-clamp-1 font-lexend text-sm font-medium text-stone-900">
                                        {item.artwork?.title || "Untitled"}
                                    </h3>
                                    <p className="text-xs text-stone-500">
                                        {item.artwork?.artist || "Unknown"}
                                    </p>
                                    {metaParts.length > 0 && (
                                        <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-stone-400">
                                            {metaParts.join(" · ")}
                                        </p>
                                    )}
                                    {isDisabled && (
                                        <p className="mt-1 text-xs font-medium text-red-700">
                                            {isSold
                                                ? "Sold — cannot purchase"
                                                : "Not available"}
                                        </p>
                                    )}
                                    <div className="mt-2 flex items-center justify-between gap-2">
                                        <span className="text-[11px] text-stone-500">
                                            Qty {item.quantity}
                                        </span>
                                        <span className="font-lexend text-xs font-semibold tabular-nums text-stone-900">
                                            {formatMoney(
                                                (Number(item.artwork?.desiredPrice) || 0) *
                                                    item.quantity,
                                                currency,
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 shrink-0 p-0 text-stone-400 hover:bg-transparent hover:text-red-700"
                                    onClick={() => handleRemove(item.artworkId)}
                                    disabled={isRemoving}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        )
                    })
                )}
            </div>

            {cartItems.length > 0 && selectedItems.length === 0 && (
                <p className="border-t border-amber-100 bg-amber-50/80 px-5 py-2 text-xs text-amber-800">
                    No items selected
                </p>
            )}

            {sellerGroups.length > 0 && (
                <div className="space-y-4 border-t border-stone-200/80 px-5 py-4">
                    {sellerGroups.map((group) => {
                        const state = sellerCheckouts[group.sellerId]
                        // Merchandise + shipping always USD; charge currency is decided at prepare
                        const subtotal = group.items.reduce((sum, item) => {
                            return (
                                sum +
                                (Number(item.artwork?.desiredPrice) || 0) * item.quantity
                            )
                        }, 0)
                        const shipping = Number(state?.shippingOption?.totalCharge) || 0
                        const total = subtotal + shipping
                        return (
                            <div key={group.sellerId} className="space-y-1.5">
                                <p className="font-lexend text-xs font-semibold text-stone-900">
                                    {group.sellerName}
                                    {state?.paymentMethod
                                        ? ` · ${state.paymentMethod === "chapa" ? "Chapa" : "PayPal"}`
                                        : ""}
                                </p>
                                <div className="flex justify-between text-xs text-stone-500">
                                    <span>Subtotal</span>
                                    <span className="tabular-nums text-stone-800">
                                        {formatMoney(subtotal, "USD")}
                                    </span>
                                </div>
                                {state?.shippingOption && (
                                    <div className="flex justify-between text-xs text-stone-500">
                                        <span className="truncate pr-2">
                                            Shipping · {state.shippingOption.serviceName}
                                        </span>
                                        <span className="shrink-0 tabular-nums text-stone-800">
                                            {formatMoney(shipping, "USD")}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xs font-semibold text-stone-900">
                                    <span>Seller total</span>
                                    <span className="tabular-nums">
                                        {formatMoney(total, "USD")}
                                    </span>
                                </div>
                                {state?.paymentMethod === "chapa" && (
                                    <p className="text-[10px] text-stone-500">
                                        Charged in ETB at a locked rate when you place the order
                                    </p>
                                )}
                            </div>
                        )
                    })}
                    <p className="text-[10px] uppercase tracking-[0.14em] text-stone-400">
                        One payment per seller · USD pricing · Chapa locks ETB at checkout
                    </p>
                </div>
            )}

            <div className="border-t border-stone-100 px-5 py-3">
                <p className="text-[11px] text-stone-400">Secure checkout · 30-day guarantee</p>
            </div>
        </aside>
    )
}
