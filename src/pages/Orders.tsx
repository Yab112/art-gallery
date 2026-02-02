import { ProtectedRoute } from "@/components/auth/protected-route"
import { OrdersSkeleton } from "@/components/skeletons/orders-skeleton"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { useUserOrders } from "@/queries/orderQueries"
import { ShoppingBag } from "lucide-react"
import { useEffect } from "react"
import { Link } from "react-router-dom"

export default function OrdersPage() {
    const { data: orders = [], isLoading, error } = useUserOrders()

    // Debug logging
    useEffect(() => {
        console.log("OrdersPage - Orders count:", orders.length)
        if (orders.length > 0) {
            console.log("OrdersPage - Sample order:", orders[0])
        }
    }, [orders])

    if (isLoading) {
        return (
            <ProtectedRoute>
                <OrdersSkeleton />
            </ProtectedRoute>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <EmptyState
                    icon={ShoppingBag}
                    title="Error Loading Orders"
                    description="Failed to load your orders. Please try again later."
                />
            </div>
        )
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-white">
                <div className="container mx-auto max-w-5xl px-4 py-6">
                    {/* Compact Header */}
                    <div className="mb-6 flex items-center justify-between border-gray-200 border-b pb-4">
                        <div>
                            <h1 className="font-semibold text-2xl text-gray-900">Orders</h1>
                            <p className="mt-0.5 text-gray-500 text-sm">
                                {orders.length} {orders.length === 1 ? "order" : "orders"}
                            </p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-sm" asChild>
                            <Link to="/buyart">Continue Shopping</Link>
                        </Button>
                    </div>

                    {/* Orders List */}
                    {orders.length === 0 ? (
                        <div className="py-12">
                            <EmptyState
                                icon={ShoppingBag}
                                title="No Orders Yet"
                                description="You haven't placed any orders yet. Start shopping to see your orders here."
                                actionLabel="Browse Artworks"
                                onAction={() => (window.location.href = "/buyart")}
                            />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {orders.map((order) => {
                                // Order status configuration
                                const statusConfig = {
                                    PENDING: {
                                        color: "text-yellow-600",
                                        label: "Pending"
                                    },
                                    PAID: {
                                        color: "text-green-600",
                                        label: "Paid"
                                    },
                                    CANCELLED: {
                                        color: "text-red-600",
                                        label: "Cancelled"
                                    },
                                    REFUNDED: {
                                        color: "text-gray-600",
                                        label: "Refunded"
                                    }
                                }
                                const status =
                                    statusConfig[order.status as keyof typeof statusConfig] ||
                                    statusConfig.PENDING

                                // Format date
                                const orderDate = new Date(order.createdAt).toLocaleDateString(
                                    "en-US",
                                    {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric"
                                    }
                                )

                                // Calculate total amount
                                const totalAmount =
                                    typeof order.totalAmount === "string"
                                        ? Number.parseFloat(order.totalAmount)
                                        : order.totalAmount

                                return (
                                    <div
                                        key={order.id}
                                        className="rounded-lg border border-gray-200 transition-colors hover:border-gray-300"
                                    >
                                        {/* Order Header - Compact */}
                                        <div className="flex items-center justify-between border-gray-100 border-b bg-gray-50/50 px-4 py-3">
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className={`font-medium ${status.color}`}>
                                                    {status.label}
                                                </span>
                                                <span className="text-gray-400">•</span>
                                                <span className="text-gray-500">{orderDate}</span>
                                                <span className="text-gray-400">•</span>
                                                <span className="font-mono text-gray-500 text-xs">
                                                    #{order.id.slice(0, 8).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-base text-gray-900">
                                                    $
                                                    {totalAmount.toLocaleString("en-US", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Order Items - Compact */}
                                        <div className="divide-y divide-gray-100">
                                            {order.items.map((item) => {
                                                const artwork = item.artwork
                                                if (!artwork) return null

                                                const itemPrice =
                                                    typeof item.price === "string"
                                                        ? Number.parseFloat(item.price)
                                                        : item.price
                                                const itemTotal = itemPrice * item.quantity

                                                return (
                                                    <div
                                                        key={item.id}
                                                        className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50/50"
                                                    >
                                                        {/* Artwork Image - Smaller */}
                                                        <Link
                                                            to={`/artwork/${artwork.id}`}
                                                            className="flex-shrink-0"
                                                        >
                                                            <div className="relative h-16 w-16 overflow-hidden rounded-md bg-gray-100">
                                                                <img
                                                                    src={
                                                                        artwork.photos?.[0] ||
                                                                        "/placeholder.svg"
                                                                    }
                                                                    alt={
                                                                        artwork.title ||
                                                                        artwork.artist ||
                                                                        "Artwork"
                                                                    }
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            </div>
                                                        </Link>

                                                        {/* Item Details - Compact */}
                                                        <div className="min-w-0 flex-1">
                                                            <Link to={`/artwork/${artwork.id}`}>
                                                                <h3 className="truncate font-medium text-gray-900 text-sm transition-colors hover:text-red-700">
                                                                    {artwork.title || "Untitled"}
                                                                </h3>
                                                                <p className="truncate text-gray-500 text-xs">
                                                                    {artwork.artist ||
                                                                        artwork.user?.name ||
                                                                        "Unknown Artist"}
                                                                </p>
                                                            </Link>
                                                        </div>

                                                        {/* Quantity and Price - Compact */}
                                                        <div className="flex items-center gap-4 text-gray-600 text-sm">
                                                            <span className="text-xs">
                                                                Qty: {item.quantity}
                                                            </span>
                                                            <span className="font-medium text-gray-900">
                                                                $
                                                                {itemTotal.toLocaleString("en-US", {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2
                                                                })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    )
}
