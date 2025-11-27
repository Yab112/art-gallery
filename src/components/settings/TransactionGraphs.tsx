import { useState } from "react";
import { BarChart3, PieChart, TrendingUp } from "lucide-react";
import { useGetTransactionStats } from "@/services/transactions/useGetTransactionStats";
import { Button } from "@/components/ui/button";

// Simple bar chart component using CSS - Compact
const SimpleBarChart = ({ data }: { data: Array<{ date: string; amount: number; count: number }> }) => {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
        No data
      </div>
    );
  }

  const maxAmount = Math.max(...data.map((d) => d.amount), 1);

  return (
    <div className="h-48 flex items-end justify-between gap-1.5">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex flex-col items-center justify-end h-36">
            <div
              className="w-full bg-red-600 rounded-t transition-all hover:bg-red-700"
              style={{
                height: `${(item.amount / maxAmount) * 100}%`,
                minHeight: item.amount > 0 ? "3px" : "0",
              }}
              title={`$${item.amount.toFixed(2)}`}
            />
          </div>
          <span className="text-[10px] text-gray-600 text-center leading-tight">{item.date}</span>
          <span className="text-[10px] font-medium text-gray-900">
            ${item.amount.toFixed(0)}
          </span>
        </div>
      ))}
    </div>
  );
};

// Simple pie chart component - Compact
const SimplePieChart = ({
  data,
  title,
}: {
  data: Record<string, { count: number; amount: number }>;
  title: string;
}) => {
  const entries = Object.entries(data).filter(([_, value]) => value.count > 0);

  if (entries.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
        No data
      </div>
    );
  }

  const total = entries.reduce((sum, [_, value]) => sum + value.count, 0);
  const colors = ["#dc2626", "#2563eb", "#16a34a", "#ea580c", "#9333ea"];

  return (
    <div className="space-y-2">
      <div className="flex-1 space-y-2">
        {entries.map(([key, value], index) => {
          const percentage = ((value.count / total) * 100).toFixed(1);
          return (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded flex-shrink-0"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs mb-0.5">
                  <span className="text-gray-700 capitalize truncate">{key.toLowerCase()}</span>
                  <span className="text-gray-900 font-medium ml-2">{value.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: colors[index % colors.length],
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export function TransactionGraphs() {
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");
  const { data: stats, isLoading } = useGetTransactionStats(period);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-48 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">No transaction data available</p>
        <p className="text-sm text-gray-500 mt-1">
          Transaction statistics will appear here once you have transaction history.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Period Selector - Compact */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-900">Analytics</h3>
        <div className="flex gap-1">
          <Button
            variant={period === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("week")}
            className={`text-xs h-7 px-2 ${period === "week" ? "bg-red-700 hover:bg-red-800" : ""}`}
          >
            Week
          </Button>
          <Button
            variant={period === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("month")}
            className={`text-xs h-7 px-2 ${period === "month" ? "bg-red-700 hover:bg-red-800" : ""}`}
          >
            Month
          </Button>
          <Button
            variant={period === "year" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("year")}
            className={`text-xs h-7 px-2 ${period === "year" ? "bg-red-700 hover:bg-red-800" : ""}`}
          >
            Year
          </Button>
        </div>
      </div>

      {/* Summary Cards - Compact */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-gray-200 rounded-md p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <p className="text-xs text-gray-600">Total</p>
          </div>
          <p className="text-lg font-bold text-gray-900">
            ${stats.totalAmount.toLocaleString("en-US", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-md p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            <p className="text-xs text-gray-600">Count</p>
          </div>
          <p className="text-lg font-bold text-gray-900">{stats.totalCount}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-md p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <PieChart className="h-4 w-4 text-purple-600" />
            <p className="text-xs text-gray-600">Avg</p>
          </div>
          <p className="text-lg font-bold text-gray-900">
            $
            {stats.totalCount > 0
              ? (stats.totalAmount / stats.totalCount).toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })
              : "0"}
          </p>
        </div>
      </div>

      {/* Charts - Compact Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Transaction Amount Over Time */}
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Amount Over Time</h3>
          <SimpleBarChart data={stats.byDate} />
        </div>

        {/* Transactions by Status */}
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">By Status</h3>
          <SimplePieChart data={stats.byStatus} title="" />
        </div>

        {/* Transactions by Provider */}
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">By Provider</h3>
          <SimplePieChart data={stats.byProvider} title="" />
        </div>

        {/* Transaction Count Over Time */}
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Count Over Time</h3>
          {stats.byDate.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
              No data
            </div>
          ) : (
            <div className="h-48 flex items-end justify-between gap-1.5">
              {stats.byDate.map((item, index) => {
                const maxCount = Math.max(...stats.byDate.map((d) => d.count), 1);
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col items-center justify-end h-36">
                      <div
                        className="w-full bg-blue-600 rounded-t transition-all hover:bg-blue-700"
                        style={{
                          height: `${(item.count / maxCount) * 100}%`,
                          minHeight: item.count > 0 ? "3px" : "0",
                        }}
                        title={`${item.count} transactions`}
                      />
                    </div>
                    <span className="text-[10px] text-gray-600 text-center leading-tight">{item.date}</span>
                    <span className="text-[10px] font-medium text-gray-900">{item.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

