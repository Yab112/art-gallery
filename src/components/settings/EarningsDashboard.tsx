import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import useAxiosAuth from "@/hooks/use-axios-auth"
import { useQuery } from "@tanstack/react-query"
import { Calendar, DollarSign, TrendingDown } from "lucide-react"
import { useState } from "react"

interface BackendEarningsData {
    earning: number // From user table (source of truth)
    totalEarnings: number // Alias for earning
    totalSales: number
    totalCommission: number
    totalWithdrawn: number
    availableBalance: number
    salesCount: number
    sales: Array<{
        artworkId: string
        artworkTitle: string
        artworkImage: string
        salePrice: number
        commission: number
        earnings: number
        soldAt: string
        buyerEmail: string
    }>
}

interface EarningsResponse {
    success: boolean
    data: BackendEarningsData
}

interface EarningsData {
    totalEarnings: number
    availableForWithdrawal: number
    totalWithdrawn: number
    monthlyEarnings?: Array<{
        month: string
        earnings: number
    }>
}

export function EarningsDashboard() {
    const [timeRange, setTimeRange] = useState<"all" | "month" | "year">("all")
    const axiosAuth = useAxiosAuth()

    const { data, isLoading, error } = useQuery<EarningsData>({
        queryKey: ["earnings", timeRange],
        queryFn: async () => {
            const response = await axiosAuth.get<EarningsResponse>("/artist/earnings")
            const backendData = response.data.data

            // Map backend response to component's expected format
            return {
                totalEarnings: backendData.earning || backendData.totalEarnings || 0, // Use earning from user table
                availableForWithdrawal: backendData.availableBalance || 0,
                totalWithdrawn: backendData.totalWithdrawn || 0,
                monthlyEarnings: undefined // Not available from endpoint currently
            }
        }
    })

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse rounded-lg bg-gray-100 p-6">
                            <div className="mb-2 h-4 w-1/2 rounded bg-gray-200" />
                            <div className="h-8 w-3/4 rounded bg-gray-200" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <EmptyState
                icon={DollarSign}
                title="Error Loading Earnings"
                description="Failed to load your earnings data. Please try again later."
            />
        )
    }

    const earnings = data || {
        totalEarnings: 0,
        availableForWithdrawal: 0,
        totalWithdrawn: 0
    }

    const stats = [
        {
            label: "Total Earnings",
            value: `$${earnings.totalEarnings.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: DollarSign,
            color: "text-green-600",
            bgColor: "bg-green-50",
            description: "Total earnings from user table"
        },
        {
            label: "Available for Withdrawal",
            value: `$${earnings.availableForWithdrawal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: DollarSign,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            description: "Available balance after withdrawals"
        },
        {
            label: "Total Withdrawn",
            value: `$${earnings.totalWithdrawn.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: TrendingDown,
            color: "text-gray-600",
            bgColor: "bg-gray-50",
            description: "Total amount withdrawn"
        }
    ]

    return (
        <div className="space-y-6">
            {/* Time Range Filter */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 text-sm">Filter:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={timeRange === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTimeRange("all")}
                        className="rounded-full px-4"
                    >
                        All Time
                    </Button>
                    <Button
                        variant={timeRange === "month" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTimeRange("month")}
                        className="rounded-full px-4"
                    >
                        This Month
                    </Button>
                    <Button
                        variant={timeRange === "year" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTimeRange("year")}
                        className="rounded-full px-4"
                    >
                        This Year
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <div
                            key={index}
                            className={`${stat.bgColor} rounded-lg border border-gray-200 p-6`}
                        >
                            <div className="mb-2 flex items-center justify-between">
                                <p className="font-medium text-gray-600 text-sm">{stat.label}</p>
                                <Icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                            <p className={`font-bold text-2xl ${stat.color}`}>{stat.value}</p>
                            {stat.description && (
                                <p className="mt-1 text-gray-500 text-xs">{stat.description}</p>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Earnings Chart Placeholder */}
            {earnings.monthlyEarnings && earnings.monthlyEarnings.length > 0 && (
                <div className="rounded-lg border border-gray-200 bg-white p-6">
                    <h3 className="mb-4 font-semibold text-gray-900 text-lg">Earnings Over Time</h3>
                    <div className="flex h-64 items-center justify-center text-gray-500">
                        <p>Chart visualization coming soon</p>
                    </div>
                </div>
            )}

            {earnings.totalEarnings === 0 && (
                <div className="py-8 text-center text-gray-500">
                    <p>No earnings data available yet.</p>
                    <p className="mt-2 text-sm">Start selling your artwork to see earnings here.</p>
                </div>
            )}
        </div>
    )
}
