import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/hooks/use-axios-auth";
import { DollarSign, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

interface BackendEarningsData {
  earning: number; // From user table (source of truth)
  totalEarnings: number; // Alias for earning
  totalSales: number;
  totalCommission: number;
  totalWithdrawn: number;
  availableBalance: number;
  salesCount: number;
  sales: Array<{
    artworkId: string;
    artworkTitle: string;
    artworkImage: string;
    salePrice: number;
    commission: number;
    earnings: number;
    soldAt: string;
    buyerEmail: string;
  }>;
}

interface EarningsResponse {
  success: boolean;
  data: BackendEarningsData;
}

interface EarningsData {
  totalEarnings: number;
  availableForWithdrawal: number;
  totalWithdrawn: number;
  monthlyEarnings?: Array<{
    month: string;
    earnings: number;
  }>;
}

export function EarningsDashboard() {
  const [timeRange, setTimeRange] = useState<"all" | "month" | "year">("all");
  const axiosAuth = useAxiosAuth();

  const { data, isLoading, error } = useQuery<EarningsData>({
    queryKey: ["earnings", timeRange],
    queryFn: async () => {
      const response = await axiosAuth.get<EarningsResponse>(`/artist/earnings`);
      const backendData = response.data.data;
      
      // Map backend response to component's expected format
      return {
        totalEarnings: backendData.earning || backendData.totalEarnings || 0, // Use earning from user table
        availableForWithdrawal: backendData.availableBalance || 0,
        totalWithdrawn: backendData.totalWithdrawn || 0,
        monthlyEarnings: undefined, // Not available from endpoint currently
      };
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-8 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={DollarSign}
        title="Error Loading Earnings"
        description="Failed to load your earnings data. Please try again later."
      />
    );
  }

  const earnings = data || {
    totalEarnings: 0,
    availableForWithdrawal: 0,
    totalWithdrawn: 0,
  };

  const stats = [
    {
      label: "Total Earnings",
      value: `$${earnings.totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Total earnings from user table",
    },
    {
      label: "Available for Withdrawal",
      value: `$${earnings.availableForWithdrawal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Available balance after withdrawals",
    },
    {
      label: "Total Withdrawn",
      value: `$${earnings.totalWithdrawn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingDown,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      description: "Total amount withdrawn",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Time Range Filter */}
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-gray-500" />
        <div className="flex gap-2">
          <Button
            variant={timeRange === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("all")}
          >
            All Time
          </Button>
          <Button
            variant={timeRange === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("month")}
          >
            This Month
          </Button>
          <Button
            variant={timeRange === "year" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("year")}
          >
            This Year
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`${stat.bgColor} rounded-lg p-6 border border-gray-200`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
              {stat.description && (
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Earnings Chart Placeholder */}
      {earnings.monthlyEarnings && earnings.monthlyEarnings.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Earnings Over Time
          </h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <p>Chart visualization coming soon</p>
          </div>
        </div>
      )}

      {earnings.totalEarnings === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No earnings data available yet.</p>
          <p className="text-sm mt-2">
            Start selling your artwork to see earnings here.
          </p>
        </div>
      )}
    </div>
  );
}

