import { useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/ui/empty-state";
import { useUserOrders } from "@/queries/orderQueries";
import { OrdersSkeleton } from "@/components/skeletons/orders-skeleton";

export default function OrdersPage() {
  const { data: orders = [], isLoading, error } = useUserOrders();

  // Debug logging
  useEffect(() => {
    console.log("OrdersPage - Orders count:", orders.length);
    if (orders.length > 0) {
      console.log("OrdersPage - Sample order:", orders[0]);
    }
  }, [orders]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <OrdersSkeleton />
      </ProtectedRoute>
    );
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
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-blue-700" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      My Orders
                    </h1>
                    <p className="text-gray-500 mt-1">
                      {orders.length}{" "}
                      {orders.length === 1 ? "order" : "orders"} total
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  asChild
                >
                  <Link to="/buyart">
                    <ShoppingBag className="h-4 w-4" />
                    Continue Shopping
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
              <EmptyState
                icon={ShoppingBag}
                title="No Orders Yet"
                description="You haven't placed any orders yet. Start shopping to see your orders here."
                actionLabel="Browse Artworks"
                onAction={() => (window.location.href = "/buyart")}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                // Order status configuration
                const statusConfig = {
                  PENDING: {
                    icon: Clock,
                    color: "text-yellow-600",
                    bg: "bg-yellow-100",
                    label: "Pending",
                  },
                  PAID: {
                    icon: CheckCircle2,
                    color: "text-green-600",
                    bg: "bg-green-100",
                    label: "Paid",
                  },
                  CANCELLED: {
                    icon: XCircle,
                    color: "text-red-600",
                    bg: "bg-red-100",
                    label: "Cancelled",
                  },
                  REFUNDED: {
                    icon: XCircle,
                    color: "text-gray-600",
                    bg: "bg-gray-100",
                    label: "Refunded",
                  },
                };
                const status =
                  statusConfig[order.status as keyof typeof statusConfig] ||
                  statusConfig.PENDING;
                const StatusIcon = status.icon;

                // Format date
                const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });

                // Calculate total amount
                const totalAmount = typeof order.totalAmount === 'string' 
                  ? parseFloat(order.totalAmount) 
                  : order.totalAmount;

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    {/* Order Header */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>Ordered on {orderDate}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="text-xl font-bold text-gray-900">
                          ${totalAmount.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-4">
                      {order.items.map((item) => {
                        const artwork = item.artwork;
                        if (!artwork) return null;

                        const itemPrice = typeof item.price === 'string' 
                          ? parseFloat(item.price) 
                          : item.price;
                        const itemTotal = itemPrice * item.quantity;

                        return (
                          <div
                            key={item.id}
                            className="flex flex-col md:flex-row gap-4"
                          >
                            {/* Artwork Image */}
                            <Link
                              to={`/artwork/${artwork.id}`}
                              className="flex-shrink-0"
                            >
                              <div className="relative w-24 h-24 md:w-32 md:h-32 overflow-hidden rounded-lg bg-gray-100">
                                <img
                                  src={artwork.photos?.[0] || "/placeholder.svg"}
                                  alt={artwork.title || artwork.artist || "Artwork"}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            </Link>

                            {/* Item Details */}
                            <div className="flex-1 flex flex-col md:flex-row justify-between gap-4">
                              <div className="flex-1">
                                <Link to={`/artwork/${artwork.id}`}>
                                  <h3 className="font-semibold text-gray-900 text-base mb-1 hover:text-red-700 transition-colors">
                                    {artwork.title || "Untitled"}
                                  </h3>
                                  <p className="text-gray-600 text-sm mb-2">
                                    by {artwork.artist || artwork.user?.name || "Unknown Artist"}
                                  </p>
                                </Link>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span>Quantity: {item.quantity}</span>
                                  <span>•</span>
                                  <span>
                                    ${itemPrice.toLocaleString("en-US", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-col items-end justify-center gap-2">
                                <div className="text-right">
                                  <p className="text-sm text-gray-500">Item Total</p>
                                  <p className="text-lg font-semibold text-gray-900">
                                    ${itemTotal.toLocaleString("en-US", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </p>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                  <Link to={`/artwork/${artwork.id}`}>
                                    View Artwork
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
