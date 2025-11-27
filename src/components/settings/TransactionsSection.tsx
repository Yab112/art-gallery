import { useState, useEffect } from "react";
import { Receipt, ChevronDown, ChevronUp, Clock, CheckCircle, XCircle, RefreshCw, List, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetTransactions } from "@/services/transactions/useGetTransactions";
import { TransactionGraphs } from "./TransactionGraphs";

// Simple pagination component
const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number; 
  totalPages: number; 
  onPageChange: (page: number) => void;
}) => (
  <div className="flex items-center justify-center gap-2">
    <Button
      variant="outline"
      size="sm"
      disabled={currentPage === 1}
      onClick={() => onPageChange(currentPage - 1)}
      className="h-7 px-3 text-xs"
    >
      Previous
    </Button>
    <span className="text-xs text-gray-600">
      Page {currentPage} of {totalPages}
    </span>
    <Button
      variant="outline"
      size="sm"
      disabled={currentPage >= totalPages}
      onClick={() => onPageChange(currentPage + 1)}
      className="h-7 px-3 text-xs"
    >
      Next
    </Button>
  </div>
);

export function TransactionsSection() {
  const [activeTab, setActiveTab] = useState<"list" | "graphs">("list");
  const [expandedTransactions, setExpandedTransactions] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const limit = 10;

  const { data: transactionsData, isLoading, refetch } = useGetTransactions(
    page,
    limit,
    statusFilter !== "all" ? statusFilter : undefined,
    providerFilter !== "all" ? providerFilter : undefined
  );

  const transactions = transactionsData?.data ?? [];
  const pagination = transactionsData?.pagination || { page: 1, limit, total: 0, pages: 1 };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "INITIATED":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "FAILED":
      case "CANCELLED":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "REFUNDED":
        return <XCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "text-green-600 bg-green-50";
      case "INITIATED":
        return "text-yellow-600 bg-yellow-50";
      case "FAILED":
      case "CANCELLED":
        return "text-red-600 bg-red-50";
      case "REFUNDED":
        return "text-orange-600 bg-orange-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "INITIATED":
        return "INITIATED";
      case "COMPLETED":
        return "COMPLETED";
      case "FAILED":
        return "FAILED";
      case "CANCELLED":
        return "CANCELLED";
      case "REFUNDED":
        return "REFUNDED";
      default:
        return status;
    }
  };

  const getProviderLabel = (provider: string | null) => {
    if (!provider) return "Unknown";
    switch (provider.toLowerCase()) {
      case "chapa":
        return "Chapa";
      case "paypal":
        return "PayPal";
      default:
        return provider;
    }
  };

  const toggleTransactionDetails = (transactionId: string) => {
    setExpandedTransactions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(transactionId)) {
        newSet.delete(transactionId);
      } else {
        newSet.add(transactionId);
      }
      return newSet;
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Scroll to top whenever page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabs - Compact */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("list")}
            className={`${
              activeTab === "list"
                ? "border-red-700 text-red-700"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-2.5 px-1 border-b-2 font-medium text-sm flex items-center gap-1.5`}
          >
            <List className="h-3.5 w-3.5" />
            List
          </button>
          <button
            onClick={() => setActiveTab("graphs")}
            className={`${
              activeTab === "graphs"
                ? "border-red-700 text-red-700"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-2.5 px-1 border-b-2 font-medium text-sm flex items-center gap-1.5`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Analytics
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "list" && (
        <>
          {/* Filters - Compact */}
          <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <label className="text-xs font-medium text-gray-600 mb-1 block">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">All</option>
            <option value="INITIATED">Initiated</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="text-xs font-medium text-gray-600 mb-1 block">
            Provider
          </label>
          <select
            value={providerFilter}
            onChange={(e) => {
              setProviderFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">All</option>
            <option value="chapa">Chapa</option>
            <option value="paypal">PayPal</option>
          </select>
        </div>
        <div className="flex items-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-8 text-xs px-2"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Transactions List - Minimal */}
      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <Receipt className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 font-medium text-sm">No transactions found</p>
          <p className="text-xs text-gray-500 mt-1">
            Your transaction history will appear here once you make a purchase.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {transactions.map((transaction) => {
            const isExpanded = expandedTransactions.has(transaction.id);
            const metadata = transaction.metadata || {};
            const txRef = metadata.txRef || transaction.id;

            return (
              <div key={transaction.id} className="py-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(transaction.status)}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {transaction.order.items.length > 0
                            ? transaction.order.items[0].artwork.title
                            : "Order Payment"}
                          {transaction.order.items.length > 1 && (
                            <span className="text-gray-500 ml-1 text-xs">
                              +{transaction.order.items.length - 1}
                            </span>
                          )}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 mt-0.5">
                          <span className="font-semibold text-gray-900">
                            ${Number(transaction.amount).toLocaleString("en-US", {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            })}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getStatusColor(
                              transaction.status
                            )}`}
                          >
                            {getStatusLabel(transaction.status)}
                          </span>
                          {transaction.provider && (
                            <span className="text-gray-500">
                              {getProviderLabel(transaction.provider)}
                            </span>
                          )}
                          <span className="text-gray-500">
                            {new Date(transaction.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleTransactionDetails(transaction.id)}
                    className="ml-2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Expanded Details - Minimal */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-gray-500 text-[10px] mb-0.5">Transaction ID</p>
                        <p className="font-mono text-xs text-gray-900 break-all">
                          {transaction.id}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-[10px] mb-0.5">Order ID</p>
                        <p className="font-mono text-xs text-gray-900 break-all">
                          {transaction.orderId}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-[10px] mb-0.5">Payment Provider</p>
                        <p className="text-gray-900 text-xs">
                          {getProviderLabel(transaction.provider)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-[10px] mb-0.5">Order Status</p>
                        <p className="text-gray-900 text-xs">{transaction.order.status}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-[10px] mb-0.5">Transaction Reference</p>
                        <p className="font-mono text-xs text-gray-900 break-all">
                          {txRef}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-[10px] mb-0.5">Date</p>
                        <p className="text-gray-900 text-xs">
                          {new Date(transaction.createdAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Order Items - Minimal */}
                    {transaction.order.items.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-700 mb-1.5">
                          Items ({transaction.order.items.length})
                        </p>
                        <div className="space-y-1.5">
                          {transaction.order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-2 py-1.5"
                            >
                              {item.artwork.photos && item.artwork.photos[0] && (
                                <img
                                  src={item.artwork.photos[0]}
                                  alt={item.artwork.title}
                                  className="w-8 h-8 object-cover rounded"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-900 truncate">
                                  {item.artwork.title}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  {item.quantity} × ${Number(item.price).toFixed(0)}
                                </p>
                              </div>
                              <p className="text-xs font-semibold text-gray-900">
                                ${(Number(item.price) * item.quantity).toFixed(0)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Order Total - Minimal */}
                    <div className="flex justify-end pt-2 border-t border-gray-100">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-base font-bold text-gray-900">
                          $
                          {Number(transaction.order.totalAmount).toLocaleString(
                            "en-US",
                            {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pt-4">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}
        </>
      )}

      {activeTab === "graphs" && <TransactionGraphs />}
    </div>
  );
}

