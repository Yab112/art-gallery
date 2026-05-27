import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import useAxiosAuth from "@/hooks/use-axios-auth"
import { useQuery } from "@tanstack/react-query"
import { Calendar, DollarSign, TrendingDown } from "lucide-react"
import { useState } from "react"

interface BackendEarningsData {
    earning: number // Legacy total
    totalEarningsPaypal: number
    totalEarningsChapa: number
    totalWithdrawnPaypal: number
    totalWithdrawnChapa: number
    availableBalancePaypal: number
    availableBalanceChapa: number
}

interface EarningsResponse {
    success: boolean
    data: BackendEarningsData
}

interface EarningsData {
    totalPaypal: number
    availablePaypal: number
    withdrawnPaypal: number
    totalChapa: number
    availableChapa: number
    withdrawnChapa: number
}

export function EarningsDashboard() {
    const [timeRange, setTimeRange] = useState<"all" | "month" | "year">("all")
    const axiosAuth = useAxiosAuth()

    const { data, isLoading, error } = useQuery<EarningsData>({
        queryKey: ["earnings", timeRange],
        queryFn: async () => {
            const response = await axiosAuth.get<EarningsResponse>("/artist/earnings")
            const backendData = response.data.data

            return {
                totalPaypal: backendData.totalEarningsPaypal || 0,
                availablePaypal: backendData.availableBalancePaypal || 0,
                withdrawnPaypal: backendData.totalWithdrawnPaypal || 0,
                totalChapa: backendData.totalEarningsChapa || 0,
                availableChapa: backendData.availableBalanceChapa || 0,
                withdrawnChapa: backendData.totalWithdrawnChapa || 0,
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
        totalPaypal: 0,
        availablePaypal: 0,
        withdrawnPaypal: 0,
        totalChapa: 0,
        availableChapa: 0,
        withdrawnChapa: 0,
    }

    const sections = [
        {
            title: "PayPal Earnings (USD)",
            stats: [
                {
                    label: "Total Earnings",
                    value: `$${earnings.totalPaypal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    icon: DollarSign,
                    color: "text-green-600",
                    bgColor: "bg-green-50",
                },
                {
                    label: "Available Balance",
                    value: `$${earnings.availablePaypal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    icon: DollarSign,
                    color: "text-blue-600",
                    bgColor: "bg-blue-50",
                },
                {
                    label: "Total Withdrawn",
                    value: `$${earnings.withdrawnPaypal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    icon: TrendingDown,
                    color: "text-gray-600",
                    bgColor: "bg-gray-50",
                }
            ]
        },
        {
            title: "Chapa Earnings (ETB)",
            stats: [
                {
                    label: "Total Earnings",
                    value: `ETB ${earnings.totalChapa.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    icon: DollarSign,
                    color: "text-orange-600",
                    bgColor: "bg-orange-50",
                },
                {
                    label: "Available Balance",
                    value: `ETB ${earnings.availableChapa.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    icon: DollarSign,
                    color: "text-blue-600",
                    bgColor: "bg-blue-50",
                },
                {
                    label: "Total Withdrawn",
                    value: `ETB ${earnings.withdrawnChapa.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    icon: TrendingDown,
                    color: "text-gray-600",
                    bgColor: "bg-gray-50",
                }
            ]
        }
    ]

    return (
        <div className="space-y-10">
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
                </div>
            </div>

            {sections.map((section, sIndex) => (
                <div key={sIndex} className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">{section.title}</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {section.stats.map((stat, index) => {
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
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}

            {earnings.totalPaypal === 0 && earnings.totalChapa === 0 && (
                <div className="py-8 text-center text-gray-500">
                    <p>No earnings data available yet.</p>
                    <p className="mt-2 text-sm">Start selling your artwork to see earnings here.</p>
                </div>
            )}
        </div>
    )
}
