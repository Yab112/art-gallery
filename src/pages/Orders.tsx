import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/ui/empty-state";
import { useCartItems } from "@/queries/cartQueries";
import { useState } from "react";
import { OrdersSkeleton } from "@/components/skeletons/orders-skeleton";

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, isLoading, error } = useCartItems(page, limit);

  // For now, we'll use cart items as orders since orders endpoint doesn't exist yet
  // This can be updated when orders API is implemented
  const orders = data?.items || [];
  const pagination = data
    ? {
        page: data.page || 1,
        limit: data.limit || limit,
        total: data.total || 0,
        pages: data.pages || 1,
      }
    : { page: 1, limit, total: 0, pages: 1 };

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
                      {pagination.total}{" "}
                      {pagination.total === 1 ? "order" : "orders"} total
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
                const artwork = order.artwork;
                if (!artwork) return null;

                // Mock order status - replace with actual order status when orders API is implemented
                const orderStatus = "pending"; // pending, processing, shipped, delivered, cancelled
                const statusConfig = {
                  pending: {
                    icon: Clock,
                    color: "text-yellow-600",
                    bg: "bg-yellow-100",
                    label: "Pending",
                  },
                  processing: {
                    icon: Package,
                    color: "text-blue-600",
                    bg: "bg-blue-100",
                    label: "Processing",
                  },
                  shipped: {
                    icon: Package,
                    color: "text-purple-600",
                    bg: "bg-purple-100",
                    label: "Shipped",
                  },
                  delivered: {
                    icon: CheckCircle2,
                    color: "text-green-600",
                    bg: "bg-green-100",
                    label: "Delivered",
                  },
                  cancelled: {
                    icon: XCircle,
                    color: "text-red-600",
                    bg: "bg-red-100",
                    label: "Cancelled",
                  },
                };
                const status =
                  statusConfig[orderStatus as keyof typeof statusConfig] ||
                  statusConfig.pending;
                const StatusIcon = status.icon;

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Artwork Image */}
                      <Link
                        to={`/artwork/${artwork.id}`}
                        className="flex-shrink-0"
                      >
                        <div className="relative w-32 h-32 md:w-40 md:h-40 overflow-hidden rounded-lg bg-gray-100">
                          <img
                            src={artwork.photos?.[0] || "/placeholder.svg"}
                            alt={artwork.title || artwork.artist}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </Link>

                      {/* Order Details */}
                      <div className="flex-1 flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <Link to={`/artwork/${artwork.id}`}>
                            <h3 className="font-semibold text-gray-900 text-lg mb-1 hover:text-red-700 transition-colors">
                              {artwork.title || "Untitled"}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2">
                              by {artwork.artist}
                            </p>
                          </Link>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                            <span>Quantity: {order.quantity}</span>
                            <span>•</span>
                            <span>
                              ${artwork.desiredPrice?.toLocaleString() || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end justify-between gap-2">
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Total</p>
                            <p className="text-2xl font-bold text-gray-900">
                              $
                              {(
                                (artwork.desiredPrice || 0) * order.quantity
                              ).toLocaleString()}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/artwork/${artwork.id}`}>
                              View Details
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pagination.pages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
