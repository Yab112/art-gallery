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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import useAxiosAuth from "@/hooks/use-axios-auth"
import { useGetEarnings } from "@/services/artist/useGetEarnings"
import { useGetWithdrawals } from "@/services/artist/useGetWithdrawals"
import { useRequestWithdrawal } from "@/services/artist/useRequestWithdrawal"
import { usePaymentSettings, usePlatformSettings } from "@/queries/settingsQueries"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Clock,
    Plus,
    RefreshCw,
    Search,
    Wallet,
    XCircle,
    Check
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

interface Withdrawal {
    id: string
    amount: number
    currency: string
    method: string
    status: string
    paypalStatus?: string
    payoutAccount: string
    createdAt: string
    rejectionReason?: string
}

export function WithdrawalSection() {
    const [payoutMethod, setPayoutMethod] = useState<"paypal" | "bank">("paypal")
    const [bankCode, setBankCode] = useState("")
    const [accountName, setAccountName] = useState("")
    const [withdrawalAmount, setWithdrawalAmount] = useState("")
    const [iban, setIban] = useState("")
    const [useManualIban, setUseManualIban] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [isBankListOpen, setIsBankListOpen] = useState(false)
    const [expandedWithdrawals, setExpandedWithdrawals] = useState<Set<string>>(new Set())
    const [page, setPage] = useState(1)
    const [isRefreshing, setIsRefreshing] = useState(false)

    const { data: paymentSettingsData } = usePaymentSettings()
    const axiosAuth = useAxiosAuth()
    const queryClient = useQueryClient()
    const limit = 10

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["artist-withdrawals"] }),
            queryClient.invalidateQueries({ queryKey: ["artist-earnings"] })
        ])
        setIsRefreshing(false)
    }

    // Get withdrawals using the correct hook with pagination
    const {
        data: withdrawalsData,
        isLoading: isLoadingWithdrawals,
        refetch: refetchWithdrawals
    } = useGetWithdrawals(page, limit)
    const withdrawals = (withdrawalsData?.data ?? []) as Withdrawal[]
    const pagination = withdrawalsData?.pagination || { page: 1, limit, total: 0, pages: 1 }

    // Fetch all withdrawals to check for pending ones (not just current page)
    const { data: allWithdrawalsData } = useGetWithdrawals(1, 1000) // Get all withdrawals to check for pending
    const allWithdrawals = (allWithdrawalsData?.data ?? []) as Withdrawal[]

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
    const availableBalance = payoutMethod === 'bank' 
        ? earningsData?.data?.availableBalanceChapa ?? 0 
        : earningsData?.data?.availableBalancePaypal ?? 0

    // Get payment method preference
    const { data: paymentPreferenceData, isLoading: isLoadingPreference } = useQuery({
        queryKey: ["payment-method-preference"],
        queryFn: async () => {
            const response = await axiosAuth.get("/profile/payment-method-preference")
            return response.data?.data || null
        },
        enabled: isDialogOpen
    })
    const paymentPreference = paymentPreferenceData

    // Get Chapa supported banks
    const { data: chapaBanks, isLoading: isLoadingBanks } = useQuery({
        queryKey: ["chapa-banks"],
        queryFn: async () => {
            const response = await axiosAuth.get("/payment/chapa/banks")
            return response.data?.data || []
        },
        enabled: isDialogOpen
    })

    // Prefill form details from paymentPreference on dialog open
    useEffect(() => {
        if (isDialogOpen && paymentPreference) {
            const preferredMethod = paymentPreference.method === "chapa" ? "bank" : "paypal"
            setPayoutMethod(preferredMethod)
            if (preferredMethod === "bank") {
                setIban(paymentPreference.chapaAccountNumber || "")
                setBankCode(paymentPreference.chapaBankCode || "")
                setAccountName(paymentPreference.chapaAccountName || "")
            } else {
                setIban(paymentPreference.paypalEmail || "")
                setBankCode("")
                setAccountName("")
            }
        }
    }, [isDialogOpen, paymentPreference])

    const handleMethodChange = (method: "paypal" | "bank") => {
        setPayoutMethod(method)
        if (method === "bank") {
            setIban(paymentPreference?.chapaAccountNumber || "")
            setBankCode(paymentPreference?.chapaBankCode || "")
            setAccountName(paymentPreference?.chapaAccountName || "")
        } else {
            setIban(paymentPreference?.paypalEmail || "")
            setBankCode("")
            setAccountName("")
        }
    }

    const minWithdrawalAmount = (payoutMethod === 'bank'
        ? paymentSettingsData?.settings?.minWithdrawalAmountChapa
        : paymentSettingsData?.settings?.minWithdrawalAmountPaypal) ?? 0
    const maxWithdrawalAmount = (payoutMethod === 'bank'
        ? paymentSettingsData?.settings?.maxWithdrawalAmountChapa
        : paymentSettingsData?.settings?.maxWithdrawalAmountPaypal) ?? 0

    const isLoading = isLoadingWithdrawals || isLoadingEarnings || (isDialogOpen && isLoadingPreference)

    const { mutateAsync: requestWithdrawal, isPending: isSubmitting } = useRequestWithdrawal()

    const handleWithdrawal = async (e: React.FormEvent) => {
        e.preventDefault()
        const amount = Number.parseFloat(withdrawalAmount)

        if (isNaN(amount) || (minWithdrawalAmount !== undefined && amount < minWithdrawalAmount)) {
            const currencySymbol = payoutMethod === "bank" ? "ETB" : "$"
            toast.error(`Minimum withdrawal amount is ${currencySymbol}${minWithdrawalAmount}`)
            return
        }

        if (maxWithdrawalAmount > 0 && amount > maxWithdrawalAmount) {
            const currencySymbol = payoutMethod === "bank" ? "ETB" : "$"
            toast.error(`Maximum withdrawal amount is ${currencySymbol}${maxWithdrawalAmount}`)
            return
        }

        if (amount > availableBalance) {
            toast.error("Amount exceeds available balance")
            return
        }

        if (payoutMethod === "bank") {
            if (!iban || !accountName || !bankCode) {
                toast.error("Please fill in all bank details (Account Name, Account/Phone Number, and Bank/Wallet)")
                return
            }
        } else {
            if (!iban) {
                toast.error("Please enter your PayPal email address")
                return
            }
        }

        try {
            await requestWithdrawal({ 
                amount, 
                iban,
                ...(payoutMethod === "bank" ? { bankCode: bankCode || "mobile", accountName } : {})
            })
            toast.success("Withdrawal request submitted successfully")
            setIsDialogOpen(false)
            setWithdrawalAmount("")
            setIban("")
            setBankCode("")
            setAccountName("")
            setUseManualIban(false)
            // Reset to first page and refetch
            setPage(1)
            refetchWithdrawals()
        } catch (error: any) {
            // Close modal first
            setIsDialogOpen(false)
            setWithdrawalAmount("")
            setIban("")
            setBankCode("")
            setAccountName("")
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
                return "text-green-700 bg-green-50/50 border border-green-100"
            case "PROCESSING":
                return "text-blue-700 bg-blue-50/50 border border-blue-100"
            case "FAILED":
            case "REJECTED":
                return "text-zinc-700 bg-zinc-50 border border-zinc-200"
            case "INITIATED":
                return "text-yellow-700 bg-yellow-50/50 border border-yellow-100"
            default:
                return "text-zinc-500 bg-zinc-50/50 border border-zinc-100"
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
            <div className="rounded-xl border border-zinc-100 bg-white p-6 shadow-none">
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="flex flex-col gap-6 sm:flex-row sm:gap-12">
                        <div>
                            <p className="mb-1 font-medium text-gray-500 text-sm">PayPal Balance</p>
                            <p className="font-bold text-2xl text-gray-900">
                                $
                                {(earningsData?.data?.availableBalancePaypal ?? 0).toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </p>
                        </div>
                        <div>
                            <p className="mb-1 font-medium text-gray-500 text-sm">Chapa Balance</p>
                            <p className="font-bold text-2xl text-gray-900">
                                ETB 
                                {(earningsData?.data?.availableBalanceChapa ?? 0).toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </p>
                        </div>
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
                                    className="w-full bg-black text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400 disabled:opacity-70 sm:w-auto transition-all rounded-lg text-xs"
                                    disabled={hasPendingWithdrawals}
                                >
                                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                                    Request Withdrawal
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[90vh] overflow-y-auto bg-white sm:max-w-[425px]">
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
                                            min={minWithdrawalAmount ?? 0}
                                            max={availableBalance}
                                            value={withdrawalAmount}
                                            onChange={(e) => setWithdrawalAmount(e.target.value)}
                                            placeholder="0.00"
                                            required
                                        />
                                        <p className="mt-1 text-red-600 text-xs">
                                            {minWithdrawalAmount !== undefined && `Minimum withdrawal: ${payoutMethod === 'bank' ? 'ETB' : '$'}${minWithdrawalAmount}`}
                                        </p>
                                        <p className="mt-1 text-gray-500 text-xs">
                                            Available: {payoutMethod === 'bank' ? 'ETB' : '$'}
                                            {((payoutMethod === 'bank' ? earningsData?.data?.availableBalanceChapa : earningsData?.data?.availableBalancePaypal) ?? 0).toLocaleString("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </p>
                                    </div>
                                    {/* Payout Method Selector */}
                                    <div className="space-y-2">
                                        <Label className="text-xs text-zinc-500">Payout Method</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleMethodChange("paypal")}
                                                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                                                    payoutMethod === "paypal"
                                                        ? "bg-black text-white border-black"
                                                        : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50/50"
                                                }`}
                                            >
                                                PayPal
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleMethodChange("bank")}
                                                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                                                    payoutMethod === "bank"
                                                        ? "bg-black text-white border-black"
                                                        : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50/50"
                                                }`}
                                            >
                                                Chapa (Bank/Wallet)
                                            </button>
                                        </div>
                                    </div>

                                    {/* Destination Details Form */}
                                    <div className="rounded-lg border bg-zinc-50/50 p-4 space-y-3">
                                        <div className="flex items-center justify-between border-b border-zinc-100 pb-2 mb-2">
                                            <span className="font-semibold text-xs text-zinc-700 uppercase tracking-wider">
                                                Payout Destination
                                            </span>
                                            {paymentPreference && payoutMethod === (paymentPreference.method === "chapa" ? "bank" : "paypal") && (
                                                <span className="text-[10px] bg-zinc-200/60 text-zinc-700 px-1.5 py-0.5 rounded font-medium">
                                                    Preferred
                                                </span>
                                            )}
                                        </div>

                                        {payoutMethod === "paypal" ? (
                                            <div className="space-y-2">
                                                <Label htmlFor="paypalEmail" className="text-xs text-zinc-600">
                                                    PayPal Email Address
                                                </Label>
                                                <Input
                                                    id="paypalEmail"
                                                    type="email"
                                                    placeholder="e.g. artist@example.com"
                                                    value={iban}
                                                    onChange={(e) => setIban(e.target.value)}
                                                    required
                                                    className="bg-white border-zinc-200 text-sm"
                                                />
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="space-y-2">
                                                    <Label htmlFor="accountName" className="text-xs text-zinc-600">
                                                        Account Holder Name
                                                    </Label>
                                                    <Input
                                                        id="accountName"
                                                        placeholder="e.g. Abebe Kebede"
                                                        value={accountName}
                                                        onChange={(e) => setAccountName(e.target.value)}
                                                        required
                                                        className="bg-white border-zinc-200 text-sm"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="accountNumber" className="text-xs text-zinc-600">
                                                        Account / Phone Number
                                                    </Label>
                                                    <Input
                                                        id="accountNumber"
                                                        placeholder="e.g. 1000123456789 or 0911234567"
                                                        value={iban}
                                                        onChange={(e) => setIban(e.target.value)}
                                                        required
                                                        className="bg-white border-zinc-200 text-sm"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="bankCode" className="text-xs text-zinc-600">
                                                        Bank / Wallet
                                                    </Label>
                                                    <Select
                                                        value={bankCode}
                                                        onValueChange={(val) => setBankCode(val)}
                                                    >
                                                        <SelectTrigger id="bankCode" className="w-full text-black bg-white border border-zinc-200">
                                                            <SelectValue placeholder="Select bank or wallet" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {isLoadingBanks ? (
                                                                <div className="p-2 text-xs text-zinc-500 text-center">Loading banks...</div>
                                                            ) : (chapaBanks || []).length === 0 ? (
                                                                <div className="p-2 text-xs text-zinc-500 text-center">No banks available</div>
                                                            ) : (
                                                                (chapaBanks || []).map((bank: any) => (
                                                                    <SelectItem key={bank.id} value={bank.code}>
                                                                        {bank.name} ({bank.code})
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setIsDialogOpen(false)
                                                setWithdrawalAmount("")
                                            }}
                                            className="w-full sm:w-auto"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting || (payoutMethod === "bank" && (!iban || !accountName || !bankCode)) || (payoutMethod === "paypal" && !iban)}
                                            className="w-full bg-black text-white hover:bg-zinc-800 sm:w-auto transition-all rounded-lg text-xs"
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
                        variant="ghost"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isLoadingWithdrawals || isRefreshing}
                        className="flex w-full items-center justify-center gap-2 sm:w-auto hover:bg-transparent text-gray-600 hover:text-gray-900"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${(isLoadingWithdrawals || isRefreshing) ? "animate-spin" : ""}`}
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
                                        className="rounded-xl border border-zinc-100 bg-white p-4 shadow-none"
                                    >
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                                            <div className="flex flex-1 items-center gap-3">
                                                {getStatusIcon(
                                                    withdrawal.paypalStatus || withdrawal.status
                                                )}
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">
                                                        {withdrawal.currency === "ETB" ? "ETB " : "$"}
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
                                                        <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                                                            <p className="mb-1 font-semibold text-zinc-900 text-xs">
                                                                Rejection Reason:
                                                            </p>
                                                            <p className="text-zinc-600 text-sm">
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
                                                        className={`rounded-full px-2.5 py-0.5 font-medium text-[10px] ${withdrawal.paypalStatus === "SUCCESS" ||
                                                            withdrawal.paypalStatus === "COMPLETED"
                                                            ? "bg-green-50/50 text-green-700 border border-green-100"
                                                            : withdrawal.paypalStatus ===
                                                                "UNCLAIMED"
                                                                ? "bg-yellow-50/50 text-yellow-700 border border-yellow-100"
                                                                : withdrawal.paypalStatus ===
                                                                    "FAILED" ||
                                                                    withdrawal.paypalStatus ===
                                                                    "DENIED"
                                                                    ? "bg-zinc-50 text-zinc-700 border border-zinc-200"
                                                                    : "bg-blue-50/50 text-blue-700 border border-blue-100"
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
