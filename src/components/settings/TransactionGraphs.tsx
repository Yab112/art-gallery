import { Button } from "@/components/ui/button"
import { useGetTransactionStats } from "@/services/transactions/useGetTransactionStats"
import { BarChart3, PieChart, TrendingUp } from "lucide-react"
import { useState } from "react"

// Simple bar chart component using CSS - Compact (for single data series)
const SimpleBarChart = ({
    data,
    color = "bg-zinc-950",
    hoverColor = "hover:bg-zinc-850"
}: {
    data: Array<{ date: string; amount: number; count: number }>
    color?: string
    hoverColor?: string
}) => {
    if (data.length === 0) {
        return (
            <div className="flex h-48 items-center justify-center text-gray-500 text-sm">
                No data
            </div>
        )
    }

    const maxAmount = Math.max(...data.map((d) => d.amount), 1)

    return (
        <div className="flex h-48 items-end justify-between gap-1.5">
            {data.map((item, index) => (
                <div key={index} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex h-36 w-full flex-col items-center justify-end">
                        <div
                            className={`w-full ${color} rounded-t transition-all ${hoverColor}`}
                            style={{
                                height: `${(item.amount / maxAmount) * 100}%`,
                                minHeight: item.amount > 0 ? "3px" : "0"
                            }}
                            title={`$${item.amount.toFixed(2)}`}
                        />
                    </div>
                    <span className="text-center text-[10px] text-gray-600 leading-tight">
                        {item.date}
                    </span>
                    <span className="font-medium text-[10px] text-gray-900">
                        ${item.amount.toFixed(0)}
                    </span>
                </div>
            ))}
        </div>
    )
}

// Dual bar chart for credits and debits
const DualBarChart = ({
    creditsData,
    debitsData
}: {
    creditsData: Array<{ date: string; amount: number; count: number }>
    debitsData: Array<{ date: string; amount: number; count: number }>
}) => {
    if (creditsData.length === 0 && debitsData.length === 0) {
        return (
            <div className="flex h-48 items-center justify-center text-gray-500 text-sm">
                No data
            </div>
        )
    }

    // Combine dates from both datasets
    const allDates = [
        ...new Set([...creditsData.map((d) => d.date), ...debitsData.map((d) => d.date)])
    ]
    const maxAmount = Math.max(
        ...creditsData.map((d) => d.amount),
        ...debitsData.map((d) => d.amount),
        1
    )

    return (
        <div className="flex h-48 items-end justify-between gap-1.5">
            {allDates.map((date, index) => {
                const credit = creditsData.find((d) => d.date === date) || { amount: 0, count: 0 }
                const debit = debitsData.find((d) => d.date === date) || { amount: 0, count: 0 }

                return (
                    <div key={index} className="flex flex-1 flex-col items-center gap-1">
                        <div className="flex h-36 w-full flex-col items-center justify-end gap-0.5">
                            {/* Credits bar (green) */}
                            {credit.amount > 0 && (
                                <div
                                    className="w-full rounded-t bg-green-600 transition-all hover:bg-green-700"
                                    style={{
                                        height: `${(credit.amount / maxAmount) * 100}%`,
                                        minHeight: "3px"
                                    }}
                                    title={`Credits: $${credit.amount.toFixed(2)}`}
                                />
                            )}
                            {/* Debits bar (zinc) */}
                            {debit.amount > 0 && (
                                <div
                                    className="w-full rounded-t bg-zinc-950 transition-all hover:bg-zinc-850"
                                    style={{
                                        height: `${(debit.amount / maxAmount) * 100}%`,
                                        minHeight: "3px"
                                    }}
                                    title={`Debits: $${debit.amount.toFixed(2)}`}
                                />
                            )}
                        </div>
                        <span className="text-center text-[10px] text-gray-600 leading-tight">
                            {date}
                        </span>
                        <div className="flex flex-col items-center gap-0.5">
                            {credit.amount > 0 && (
                                <span className="font-medium text-[10px] text-green-600">
                                    +${credit.amount.toFixed(0)}
                                </span>
                            )}
                            {debit.amount > 0 && (
                                <span className="font-medium text-[10px] text-zinc-900">
                                    -${debit.amount.toFixed(0)}
                                </span>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

// Simple pie chart component - Compact
const SimplePieChart = ({
    data
}: {
    data: Record<string, { count: number; amount: number }>
}) => {
    const entries = Object.entries(data).filter(([_, value]) => value.count > 0)

    if (entries.length === 0) {
        return (
            <div className="flex h-48 items-center justify-center text-gray-500 text-sm">
                No data
            </div>
        )
    }

    const total = entries.reduce((sum, [_, value]) => sum + value.count, 0)
    const colors = ["#09090b", "#27272a", "#71717a", "#a1a1aa", "#d4d4d8"]

    return (
        <div className="space-y-2">
            <div className="flex-1 space-y-2">
                {entries.map(([key, value], index) => {
                    const percentage = ((value.count / total) * 100).toFixed(1)
                    return (
                        <div key={key} className="flex items-center gap-2">
                            <div
                                className="h-3 w-3 flex-shrink-0 rounded"
                                style={{ backgroundColor: colors[index % colors.length] }}
                            />
                            <div className="min-w-0 flex-1">
                                <div className="mb-0.5 flex items-center justify-between text-xs">
                                    <span className="truncate text-gray-700 capitalize">
                                        {key.toLowerCase()}
                                    </span>
                                    <span className="ml-2 font-medium text-gray-900">
                                        {value.count}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-gray-200">
                                    <div
                                        className="h-1.5 rounded-full transition-all"
                                        style={{
                                            width: `${percentage}%`,
                                            backgroundColor: colors[index % colors.length]
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export function TransactionGraphs() {
    const [period, setPeriod] = useState<"week" | "month" | "year">("month")
    const { data: stats, isLoading } = useGetTransactionStats(period)

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="h-64 animate-pulse rounded-lg bg-gray-100" />
                <div className="h-48 animate-pulse rounded-lg bg-gray-100" />
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 py-12 text-center shadow-none">
                <BarChart3 className="mx-auto mb-4 h-12 w-12 text-zinc-400" />
                <p className="font-bold text-zinc-700 text-sm">No transaction data available</p>
                <p className="mt-1 text-zinc-500 text-xs">
                    Transaction statistics will appear here once you have transaction history.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Period Selector - Compact */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-zinc-100 border-b pb-2">
                <h3 className="whitespace-nowrap font-bold text-base text-zinc-900 uppercase tracking-wider">Analytics</h3>
                <div className="flex flex-wrap items-center gap-1.5">
                    <Button
                        variant={period === "week" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPeriod("week")}
                        className={`h-7 rounded-full px-3 text-[10px] uppercase font-semibold tracking-wider transition-all ${period === "week" ? "bg-black text-white hover:bg-zinc-800" : "bg-transparent text-zinc-500 hover:text-black border border-zinc-200"}`}
                    >
                        Week
                    </Button>
                    <Button
                        variant={period === "month" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPeriod("month")}
                        className={`h-7 rounded-full px-3 text-[10px] uppercase font-semibold tracking-wider transition-all ${period === "month" ? "bg-black text-white hover:bg-zinc-800" : "bg-transparent text-zinc-500 hover:text-black border border-zinc-200"}`}
                    >
                        Month
                    </Button>
                    <Button
                        variant={period === "year" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPeriod("year")}
                        className={`h-7 rounded-full px-3 text-[10px] uppercase font-semibold tracking-wider transition-all ${period === "year" ? "bg-black text-white hover:bg-zinc-800" : "bg-transparent text-zinc-500 hover:text-black border border-zinc-200"}`}
                    >
                        Year
                    </Button>
                </div>
            </div>

            {/* Summary Cards - Compact */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-xl border border-zinc-100 bg-white p-3 shadow-none">
                    <div className="mb-1 flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <p className="text-zinc-500 text-xs">Credits</p>
                    </div>
                    <p className="font-bold text-green-600 text-lg">
                        +$
                        {(stats.totalCredits || 0).toLocaleString("en-US", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                        })}
                    </p>
                </div>
                <div className="rounded-xl border border-zinc-100 bg-white p-3 shadow-none">
                    <div className="mb-1 flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4 rotate-180 text-zinc-950" />
                        <p className="text-zinc-500 text-xs">Debits</p>
                    </div>
                    <p className="font-bold text-lg text-zinc-950">
                        -$
                        {(stats.totalDebits || 0).toLocaleString("en-US", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                        })}
                    </p>
                </div>
                <div className="rounded-xl border border-zinc-100 bg-white p-3 shadow-none">
                    <div className="mb-1 flex items-center gap-1.5">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                        <p className="text-zinc-500 text-xs">Net</p>
                    </div>
                    <p
                        className={`font-bold text-lg ${(stats.totalCredits || 0) - (stats.totalDebits || 0) >= 0
                            ? "text-green-600"
                            : "text-zinc-950"
                            }`}
                    >
                        $
                        {((stats.totalCredits || 0) - (stats.totalDebits || 0)).toLocaleString(
                            "en-US",
                            {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            }
                        )}
                    </p>
                </div>
                <div className="rounded-xl border border-zinc-100 bg-white p-3 shadow-none">
                    <div className="mb-1 flex items-center gap-1.5">
                        <PieChart className="h-4 w-4 text-purple-600" />
                        <p className="text-zinc-500 text-xs">Count</p>
                    </div>
                    <p className="font-bold text-zinc-900 text-lg">{stats.totalCount}</p>
                </div>
            </div>

            {/* Charts - Compact Grid */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Credits and Debits Over Time */}
                <div className="rounded-xl border border-zinc-100 bg-white p-4 shadow-none">
                    <h3 className="mb-3 font-semibold text-zinc-900 text-sm">
                        Credits & Debits Over Time
                    </h3>
                    {stats.byDateCredits && stats.byDateDebits ? (
                        <DualBarChart
                             creditsData={stats.byDateCredits}
                             debitsData={stats.byDateDebits}
                        />
                    ) : (
                        <SimpleBarChart data={stats.byDate} />
                    )}
                    <div className="mt-3 flex items-center justify-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                            <div className="h-3 w-3 rounded bg-green-600" />
                            <span className="text-zinc-650">Credits (Earnings)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="h-3 w-3 rounded bg-zinc-950" />
                            <span className="text-zinc-650">Debits (Purchases/Withdrawals)</span>
                        </div>
                    </div>
                </div>

                {/* Credits Over Time */}
                <div className="rounded-xl border border-zinc-100 bg-white p-4 shadow-none">
                    <h3 className="mb-3 font-semibold text-zinc-900 text-sm">
                        Credits (Earnings) Over Time
                    </h3>
                    {stats.byDateCredits ? (
                        <SimpleBarChart
                            data={stats.byDateCredits}
                            color="bg-green-600"
                            hoverColor="hover:bg-green-700"
                        />
                    ) : (
                        <div className="flex h-48 items-center justify-center text-zinc-550 text-sm">
                            No data
                        </div>
                    )}
                </div>

                {/* Debits Over Time */}
                <div className="rounded-xl border border-zinc-100 bg-white p-4 shadow-none">
                    <h3 className="mb-3 font-semibold text-zinc-900 text-sm">
                        Debits (Purchases/Withdrawals) Over Time
                    </h3>
                    {stats.byDateDebits ? (
                        <SimpleBarChart
                            data={stats.byDateDebits}
                            color="bg-zinc-950"
                            hoverColor="hover:bg-zinc-850"
                        />
                    ) : (
                        <div className="flex h-48 items-center justify-center text-zinc-550 text-sm">
                            No data
                        </div>
                    )}
                </div>

                {/* Transactions by Status */}
                <div className="rounded-xl border border-zinc-100 bg-white p-4 shadow-none">
                    <h3 className="mb-3 font-semibold text-zinc-900 text-sm">By Status</h3>
                    <SimplePieChart data={stats.byStatus} />
                </div>

                {/* Transactions by Provider */}
                <div className="rounded-xl border border-zinc-100 bg-white p-4 shadow-none">
                    <h3 className="mb-3 font-semibold text-zinc-900 text-sm">By Provider</h3>
                    <SimplePieChart data={stats.byProvider} />
                </div>

                {/* Transaction Count Over Time */}
                <div className="rounded-xl border border-zinc-100 bg-white p-4 shadow-none">
                    <h3 className="mb-3 font-semibold text-zinc-900 text-sm">Count Over Time</h3>
                    {stats.byDate.length === 0 ? (
                        <div className="flex h-48 items-center justify-center text-gray-500 text-sm">
                            No data
                        </div>
                    ) : (
                        <div className="flex h-48 items-end justify-between gap-1.5">
                            {stats.byDate.map((item, index) => {
                                const maxCount = Math.max(...stats.byDate.map((d) => d.count), 1)
                                return (
                                    <div
                                        key={index}
                                        className="flex flex-1 flex-col items-center gap-1"
                                    >
                                        <div className="flex h-36 w-full flex-col items-center justify-end">
                                            <div
                                                className="w-full rounded-t bg-blue-600 transition-all hover:bg-blue-700"
                                                style={{
                                                    height: `${(item.count / maxCount) * 100}%`,
                                                    minHeight: item.count > 0 ? "3px" : "0"
                                                }}
                                                title={`${item.count} transactions`}
                                            />
                                        </div>
                                        <span className="text-center text-[10px] text-gray-600 leading-tight">
                                            {item.date}
                                        </span>
                                        <span className="font-medium text-[10px] text-gray-900">
                                            {item.count}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
