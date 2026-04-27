import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import useAxiosAuth from "@/hooks/use-axios-auth"
import { useGetEarnings } from "@/services/artist/useGetEarnings"
import { useGetWithdrawals } from "@/services/artist/useGetWithdrawals"
import { useRequestWithdrawal } from "@/services/artist/useRequestWithdrawal"
import { useQuery } from "@tanstack/react-query"
import {
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Clock,
    Plus,
    RefreshCw,
    Wallet,
    XCircle
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

// Simple pagination component
const Pagination = ({
    currentPage,
    totalPages,
    onPageChange
}: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) => (
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
        <span className="text-gray-600 text-xs">
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
)

export function WithdrawalSection() {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [withdrawalAmount, setWithdrawalAmount] = useState("")
    const [iban, setIban] = useState("")
    const [useManualIban, setUseManualIban] = useState(false)
    const [expandedWithdrawals, setExpandedWithdrawals] = useState<Set<string>>(new Set())
    const [page, setPage] = useState(1)
    const limit = 10
    const axiosAuth = useAxiosAuth()

    // Get withdrawals using the correct hook with pagination
    const {
        data: withdrawalsData,
        isLoading: isLoadingWithdrawals,
        refetch: refetchWithdrawals
    } = useGetWithdrawals(page, limit)
    const withdrawals = withdrawalsData?.data ?? []
    const pagination = withdrawalsData?.pagination || { page: 1, limit, total: 0, pages: 1 }

    // Fetch all withdrawals to check for pending ones (not just current page)
    const { data: allWithdrawalsData } = useGetWithdrawals(1, 1000) // Get all withdrawals to check for pending
    const allWithdrawals = allWithdrawalsData?.data ?? []

    // Check for pending withdrawals (INITIATED or PROCESSING) across all pages
    const pendingWithdrawals = allWithdrawals.filter(
        (w: any) => w.status === "INITIATED" || w.status === "PROCESSING"
    )
    const hasPendingWithdrawals = pendingWithdrawals.length > 0

    // Create tooltip message for disabled button
    const getDisabledTooltip = () => {
        if (!hasPendingWithdrawals) return ""
        const count = pendingWithdrawals.length
        const totalAmount = pendingWithdrawals.reduce(
            (sum: number, w: any) => sum + (Number(w.amount) || 0),
            0
        )
        const statuses = [...new Set(pendingWithdrawals.map((w: any) => w.status))].join(" and ")
        return `You cannot request a withdrawal while you have ${count} pending withdrawal${count > 1 ? "s" : ""} (${statuses}) totaling $${totalAmount.toFixed(2)}. Please wait until all pending withdrawals are completed or rejected.`
    }

    // Get earnings for available balance
    const { data: earningsData, isLoading: isLoadingEarnings } = useGetEarnings()
    const availableBalance = earningsData?.data?.availableBalance ?? 0

    // Get user's IBANs from their artworks (for dropdown)
    const { data: ibansData, isLoading: isLoadingIbans } = useQuery({
        queryKey: ["artist-ibans"],
        queryFn: async () => {
            try {
                const response = await axiosAuth.get("/artist/ibans")
                return response.data?.data || []
            } catch (err) {
                console.error("[Withdrawal] Failed to fetch artist IBANs:", err)
                return []
            }
        },
        enabled: isDialogOpen // Only fetch when dialog is open
    })

    const ibans: string[] = (ibansData ?? []) as string[]
    const isLoading = isLoadingWithdrawals || isLoadingEarnings || (isDialogOpen && isLoadingIbans)

    const { mutateAsync: requestWithdrawal, isPending: isSubmitting } = useRequestWithdrawal()

    const handleWithdrawal = async (e: React.FormEvent) => {
        e.preventDefault()
        const amount = Number.parseFloat(withdrawalAmount)

        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid amount")
            return
        }

        if (amount > availableBalance) {
            toast.error("Amount exceeds available balance")
            return
        }

        if (!iban || iban.trim() === "") {
            toast.error("Please select or enter an IBAN")
            return
        }

        try {
            await requestWithdrawal({ amount, iban: iban.trim() })
            toast.success("Withdrawal request submitted successfully")
            setIsDialogOpen(false)
            setWithdrawalAmount("")
            setIban("")
            setUseManualIban(false)
            // Reset to first page and refetch
            setPage(1)
            refetchWithdrawals()
        } catch (error: any) {
            // Close modal first
            setIsDialogOpen(false)
            setWithdrawalAmount("")
            setIban("")
            setUseManualIban(false)

            // Extract error message from NestJS BadRequestException response
            let errorMessage = "Failed to submit withdrawal request"

            if (error?.response?.data) {
                // NestJS BadRequestException returns message in response.data.message or response.data
                if (typeof error.response.data === "string") {
                    errorMessage = error.response.data
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message
                } else if (Array.isArray(error.response.data) && error.response.data.length > 0) {
                    errorMessage = error.response.data[0]
                }
            } else if (error?.message) {
                errorMessage = error.message
            }

            // Show error toast after modal is closed
            toast.error(errorMessage, {
                duration: 5000 // Show for 5 seconds for longer error messages
            })
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status?.toUpperCase()) {
            case "COMPLETED":
            case "SUCCESS":
                return <CheckCircle className="h-4 w-4 text-green-600" />
            case "PROCESSING":
            case "PENDING":
                return <Clock className="h-4 w-4 text-blue-600" />
            case "FAILED":
            case "REJECTED":
            case "DENIED":
                return <XCircle className="h-4 w-4 text-red-600" />
            case "INITIATED":
                return <Clock className="h-4 w-4 text-yellow-600" />
            case "UNCLAIMED":
                return <Clock className="h-4 w-4 text-yellow-600" />
            default:
                return <Clock className="h-4 w-4 text-gray-600" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return "text-green-600 bg-green-50"
            case "PROCESSING":
                return "text-blue-600 bg-blue-50"
            case "FAILED":
            case "REJECTED":
                return "text-red-600 bg-red-50"
            case "INITIATED":
                return "text-yellow-600 bg-yellow-50"
            default:
                return "text-gray-600 bg-gray-50"
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "INITIATED":
                return "INITIATED"
            case "PROCESSING":
                return "PROCESSING"
            case "COMPLETED":
                return "COMPLETED"
            case "FAILED":
                return "FAILED"
            case "REJECTED":
                return "REJECTED"
            default:
                return status
        }
    }

    const toggleWithdrawalDetails = (withdrawalId: string) => {
        setExpandedWithdrawals((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(withdrawalId)) {
                newSet.delete(withdrawalId)
            } else {
                newSet.add(withdrawalId)
            }
            return newSet
        })
    }

    const handleRequestAgain = (withdrawal: any) => {
        setWithdrawalAmount(withdrawal.amount.toString())
        setIban(withdrawal.payoutAccount || "")
        setIsDialogOpen(true)
    }

    const handlePageChange = (newPage: number) => {
        setPage(newPage)
    }

    // Scroll to top whenever page changes (for pagination)
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" })
    }, [page])

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="h-20 animate-pulse rounded-lg bg-gray-100" />
                <div className="h-32 animate-pulse rounded-lg bg-gray-100" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Available Balance */}
            <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                        <p className="mb-1 font-medium text-red-700 text-sm">Available Balance</p>
                        <p className="font-bold text-3xl text-red-900">
                            $
                            {availableBalance.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                        </p>
                    </div>
                    <div className="group relative inline-block w-full sm:w-auto">
                        <Dialog
                            open={isDialogOpen}
                            onOpenChange={(open) => {
                                // Prevent opening dialog if there are pending withdrawals
                                if (open && hasPendingWithdrawals) {
                                    toast.error(getDisabledTooltip())
                                    return
                                }
                                setIsDialogOpen(open)
                            }}
                        >
                            <DialogTrigger asChild>
                                <Button
                                    className="w-full bg-red-700 text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:opacity-70 disabled:hover:bg-gray-400 sm:w-auto"
                                    disabled={hasPendingWithdrawals}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Request Withdrawal
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-white">
                                <DialogHeader>
                                    <DialogTitle>Request Withdrawal</DialogTitle>
                                    <DialogDescription>
                                        Enter the amount you want to withdraw from your earnings.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleWithdrawal} className="space-y-4">
                                    <div>
                                        <Label htmlFor="amount">Amount</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max={availableBalance}
                                            value={withdrawalAmount}
                                            onChange={(e) => setWithdrawalAmount(e.target.value)}
                                            placeholder="0.00"
                                            required
                                        />
                                        <p className="mt-1 text-gray-500 text-xs">
                                            Available: $
                                            {availableBalance.toLocaleString("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="iban" className="mb-0">
                                                IBAN / Payment Account
                                            </Label>
                                            {ibans.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setUseManualIban(!useManualIban)
                                                        setIban("")
                                                    }}
                                                    className="font-medium text-red-700 text-xs hover:underline"
                                                >
                                                    {useManualIban
                                                        ? "Choose from saved accounts"
                                                        : "Use another account"}
                                                </button>
                                            )}
                                        </div>
                                        {ibans.length > 0 && !useManualIban ? (
                                            <select
                                                id="iban"
                                                value={iban}
                                                onChange={(e) => setIban(e.target.value)}
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500"
                                                required
                                            >
                                                <option value="">Select an IBAN</option>
                                                {ibans.map((accountIban) => (
                                                    <option key={accountIban} value={accountIban}>
                                                        {accountIban}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <Input
                                                id="iban"
                                                type="text"
                                                value={iban}
                                                onChange={(e) => setIban(e.target.value)}
                                                placeholder="Enter IBAN or PayPal email"
                                                required
                                            />
                                        )}
                                        <p className="text-gray-500 text-xs">
                                            {ibans.length > 0 && !useManualIban
                                                ? "Select from your saved payment accounts or click 'Use another account'"
                                                : "Enter your PayPal email address or IBAN where you want to receive the payment"}
                                        </p>
                                    </div>
                                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setIsDialogOpen(false)
                                                setWithdrawalAmount("")
                                                setIban("")
                                                setUseManualIban(false)
                                            }}
                                            className="w-full sm:w-auto"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-red-700 hover:bg-red-800 sm:w-auto"
                                        >
                                            {isSubmitting ? "Submitting..." : "Submit Request"}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                        {hasPendingWithdrawals && (
                            <div className="-translate-x-1/2 pointer-events-none invisible absolute bottom-full left-1/2 z-50 mb-2 w-80 transform whitespace-normal rounded-lg bg-gray-900 px-4 py-3 text-white text-xs opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:opacity-100">
                                <div className="mb-2 text-center font-semibold text-white">
                                    ⚠️ Cannot Request Withdrawal
                                </div>
                                <div className="text-gray-200 leading-relaxed">
                                    {getDisabledTooltip()}
                                </div>
                                <div className="-translate-x-1/2 -mt-1 absolute top-full left-1/2 transform">
                                    <div className="border-4 border-transparent border-t-gray-900" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Withdrawal History */}
            <div>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
                    <h3 className="font-semibold text-gray-900 text-lg">Withdrawal History</h3>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetchWithdrawals()}
                        disabled={isLoadingWithdrawals}
                        className="flex w-full items-center justify-center gap-2 sm:w-auto"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${isLoadingWithdrawals ? "animate-spin" : ""}`}
                        />
                        Refresh
                    </Button>
                </div>
                {withdrawals.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">
                        <Wallet className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                        <p>No withdrawal requests yet.</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3">
                            {withdrawals.map((withdrawal) => {
                                const isExpanded = expandedWithdrawals.has(withdrawal.id)
                                const hasRejectionReason =
                                    (withdrawal.status === "REJECTED" ||
                                        withdrawal.status === "FAILED") &&
                                    withdrawal.rejectionReason

                                return (
                                    <div
                                        key={withdrawal.id}
                                        className="rounded-lg border border-gray-200 bg-white p-4"
                                    >
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                                            <div className="flex flex-1 items-center gap-3">
                                                {getStatusIcon(
                                                    withdrawal.paypalStatus || withdrawal.status
                                                )}
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">
                                                        $
                                                        {withdrawal.amount.toLocaleString("en-US", {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        })}
                                                    </p>
                                                    <p className="text-gray-500 text-sm">
                                                        {new Date(
                                                            withdrawal.createdAt
                                                        ).toLocaleDateString()}
                                                    </p>
                                                    {withdrawal.payoutAccount && (
                                                        <p className="mt-1 text-gray-400 text-xs">
                                                            Account: {withdrawal.payoutAccount}
                                                        </p>
                                                    )}
                                                    {/* Show rejection reason only when expanded */}
                                                    {isExpanded && hasRejectionReason && (
                                                        <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3">
                                                            <p className="mb-1 font-semibold text-red-700 text-xs">
                                                                Rejection Reason:
                                                            </p>
                                                            <p className="text-red-600 text-sm">
                                                                {withdrawal.rejectionReason}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {/* Display PayPal status if available, otherwise show system status */}
                                                {withdrawal.paypalStatus ? (
                                                    <span
                                                        className={`rounded-full px-3 py-1 font-medium text-xs ${withdrawal.paypalStatus === "SUCCESS" ||
                                                            withdrawal.paypalStatus === "COMPLETED"
                                                            ? "bg-green-50 text-green-600"
                                                            : withdrawal.paypalStatus ===
                                                                "UNCLAIMED"
                                                                ? "bg-yellow-50 text-yellow-600"
                                                                : withdrawal.paypalStatus ===
                                                                    "FAILED" ||
                                                                    withdrawal.paypalStatus ===
                                                                    "DENIED"
                                                                    ? "bg-red-50 text-red-600"
                                                                    : "bg-blue-50 text-blue-600"
                                                            }`}
                                                    >
                                                        {withdrawal.paypalStatus}
                                                    </span>
                                                ) : (
                                                    <span
                                                        className={`rounded-full px-3 py-1 font-medium text-xs ${getStatusColor(
                                                            withdrawal.status
                                                        )}`}
                                                    >
                                                        {getStatusLabel(withdrawal.status)}
                                                    </span>
                                                )}
                                                {/* Show details button if there's a rejection reason */}
                                                {hasRejectionReason && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            toggleWithdrawalDetails(withdrawal.id)
                                                        }
                                                        className="h-8 w-8 p-0"
                                                        title={
                                                            isExpanded
                                                                ? "Hide details"
                                                                : "View details"
                                                        }
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronUp className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                )}
                                                {/* Show "Resubmit" button for rejected withdrawals, "Retry" for failed */}
                                                {withdrawal.status === "REJECTED" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleRequestAgain(withdrawal)
                                                        }
                                                        className="h-8 text-xs"
                                                    >
                                                        Resubmit
                                                    </Button>
                                                )}
                                                {withdrawal.status === "FAILED" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleRequestAgain(withdrawal)
                                                        }
                                                        className="h-8 text-xs"
                                                    >
                                                        Retry
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        {/* Pagination - Show if there are withdrawals */}
                        {withdrawals.length > 0 && (
                            <div className="mt-4 flex justify-center">
                                <Pagination
                                    currentPage={pagination.page || page}
                                    totalPages={Math.max(
                                        pagination.pages ||
                                        Math.ceil(
                                            (pagination.total || withdrawals.length) / limit
                                        ),
                                        1
                                    )}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
