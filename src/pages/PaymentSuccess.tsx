import { Button } from "@/components/ui/button"
import {
    clearCheckoutSession,
    loadCheckoutSession,
    markCheckoutOrderPaid,
    nextUnpaidCheckoutOrder,
    saveCheckoutSession,
} from "@/lib/checkout-sellers"
import { startPaymentForPreparedOrder } from "@/lib/start-seller-payment"
import { useVerifyPayment } from "@/services/payment/useVerifyPayment"
import type { VerifyPaymentResponse } from "@/services/payment/useVerifyPayment"
import { useQueryClient } from "@tanstack/react-query"
import { ArrowRight, CheckCircle, Loader2, XCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { toast } from "sonner"

/** Dedupe concurrent / Strict-Mode verify calls for the same PayPal/Chapa tx. */
const verifyInflight = new Map<string, Promise<VerifyPaymentResponse>>()

function verifyStorageKey(provider: string, txRef: string) {
    return `payment-verify:${provider}:${txRef}`
}

function orderIdFromTxRef(txRef: string | null | undefined): string | null {
    if (!txRef?.startsWith("TX-")) return null
    const withoutPrefix = txRef.slice(3)
    const lastDash = withoutPrefix.lastIndexOf("-")
    if (lastDash <= 0) return null
    return withoutPrefix.slice(0, lastDash) || null
}

async function continueMultiSellerCheckout(params: {
    paidOrderId?: string | null
    paidTxRef?: string | null
    remainingFromApi?: VerifyPaymentResponse["data"]["remainingOrders"]
    allPaid?: boolean
    checkoutId?: string | null
    email?: string | null
    firstName?: string | null
    lastName?: string | null
}): Promise<"done" | "continuing"> {
    const {
        paidOrderId,
        paidTxRef,
        remainingFromApi,
        allPaid,
        checkoutId,
        email,
        firstName,
        lastName,
    } = params

    let session = loadCheckoutSession()
    const resolvedPaidId =
        paidOrderId ||
        orderIdFromTxRef(paidTxRef) ||
        session?.orders.find((o) => o.txRef === paidTxRef)?.orderId ||
        null

    if (resolvedPaidId) {
        session = markCheckoutOrderPaid(resolvedPaidId) || loadCheckoutSession()
    }

    // Rebuild session from API siblings if storage was lost mid-checkout
    if (
        !session &&
        remainingFromApi &&
        remainingFromApi.length > 0 &&
        email
    ) {
        session = {
            checkoutId: checkoutId || "recovered",
            email,
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            orders: remainingFromApi.map((o) => ({
                orderId: o.orderId,
                sellerId: o.sellerId || "",
                txRef: o.txRef || "",
                totalAmount: o.totalAmount,
                currency: o.currency || "USD",
                paymentProvider: o.paymentProvider || "paypal",
                status: o.status || "PENDING",
            })),
        }
        saveCheckoutSession(session)
    }

    // Prefer API remaining list when present (authoritative after verify)
    if (remainingFromApi && session) {
        const remainingIds = new Set(remainingFromApi.map((o) => o.orderId))
        // Ensure remaining orders exist in session (API may know orders FE lost)
        for (const rem of remainingFromApi) {
            if (!session.orders.some((o) => o.orderId === rem.orderId)) {
                session.orders.push({
                    orderId: rem.orderId,
                    sellerId: rem.sellerId || "",
                    txRef: rem.txRef || "",
                    totalAmount: rem.totalAmount,
                    currency: rem.currency || "USD",
                    paymentProvider: rem.paymentProvider || "paypal",
                    status: "PENDING",
                })
            }
        }
        session = {
            ...session,
            orders: session.orders.map((o) => {
                const rem = remainingFromApi.find((r) => r.orderId === o.orderId)
                if (!remainingIds.has(o.orderId)) {
                    return { ...o, status: "PAID" }
                }
                return {
                    ...o,
                    status: "PENDING",
                    txRef: rem?.txRef || o.txRef,
                    totalAmount: rem?.totalAmount ?? o.totalAmount,
                    currency: rem?.currency || o.currency,
                    paymentProvider: rem?.paymentProvider || o.paymentProvider,
                    sellerId: rem?.sellerId || o.sellerId,
                }
            }),
        }
        saveCheckoutSession(session)
    }

    if (allPaid === true || !session) {
        clearCheckoutSession()
        return "done"
    }

    const next = nextUnpaidCheckoutOrder(session)
    if (!next?.txRef) {
        clearCheckoutSession()
        return "done"
    }

    const paidCount = session.orders.filter((o) => o.status === "PAID").length
    toast.message(
        `Paying seller ${paidCount + 1} of ${session.orders.length}`,
    )

    await startPaymentForPreparedOrder({
        order: next,
        email: session.email,
        firstName: session.firstName,
        lastName: session.lastName,
    })

    return "continuing"
}

export default function PaymentSuccessPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const queryClient = useQueryClient()
    const orderId = searchParams.get("orderId")
    const txRef = searchParams.get("txRef") || searchParams.get("token")
    const provider = searchParams.get("provider") || "chapa"

    const { mutateAsync: verifyPayment } = useVerifyPayment()
    const [verificationStatus, setVerificationStatus] = useState<
        "pending" | "continuing" | "success" | "failed"
    >("pending")
    const [verificationError, setVerificationError] = useState<string | null>(
        null,
    )
    const [resolvedOrderId, setResolvedOrderId] = useState<string | null>(
        orderId,
    )

    useEffect(() => {
        if (!txRef || !provider) {
            setVerificationStatus("failed")
            setVerificationError("Transaction reference not found")
            return
        }

        const storageKey = verifyStorageKey(provider, txRef)
        const cached = sessionStorage.getItem(storageKey)

        let cancelled = false

        const afterSuccess = async (data?: VerifyPaymentResponse) => {
            const paidId = data?.data?.orderId || orderId
            if (paidId) setResolvedOrderId(paidId)

            try {
                const result = await continueMultiSellerCheckout({
                    paidOrderId: paidId,
                    paidTxRef: data?.data?.originalTxRef || data?.data?.txRef || txRef,
                    remainingFromApi: data?.data?.remainingOrders,
                    allPaid: data?.data?.allPaid,
                    checkoutId: data?.data?.checkoutId,
                    email: data?.data?.customerEmail || loadCheckoutSession()?.email,
                    firstName: loadCheckoutSession()?.firstName,
                    lastName: loadCheckoutSession()?.lastName,
                })
                if (cancelled) return
                if (result === "continuing") {
                    setVerificationStatus("continuing")
                    return
                }
                setVerificationStatus("success")
                toast.success("Payment verified successfully!")
            } catch (err: any) {
                if (cancelled) return
                console.error("Failed to continue multi-seller checkout:", err)
                setVerificationStatus("failed")
                setVerificationError(
                    err?.message ||
                        "This payment succeeded, but the next seller payment could not start. Open Orders or retry checkout for remaining items.",
                )
                toast.error(
                    "Could not start the next seller payment. Check your orders.",
                )
            }
        }

        if (cached === "success") {
            // Resume remaining unpaid siblings after refresh
            void afterSuccess(undefined)
            return () => {
                cancelled = true
            }
        }
        if (cached?.startsWith("failed:")) {
            setVerificationStatus("failed")
            setVerificationError(
                cached.slice("failed:".length) || "Payment verification failed",
            )
            return
        }

        const inflightKey = `${provider}:${txRef}`

        const run = async () => {
            try {
                let promise = verifyInflight.get(inflightKey)
                if (!promise) {
                    promise = verifyPayment({
                        provider: provider as "chapa" | "paypal",
                        txRef,
                    })
                    verifyInflight.set(inflightKey, promise)
                    promise.finally(() => {
                        setTimeout(
                            () => verifyInflight.delete(inflightKey),
                            30_000,
                        )
                    })
                }

                const data = await promise
                if (cancelled) return

                if (data.success && data.data?.status === "success") {
                    sessionStorage.setItem(storageKey, "success")

                    queryClient.invalidateQueries({ queryKey: ["user-orders"] })
                    queryClient.invalidateQueries({ queryKey: ["cart"] })
                    queryClient.invalidateQueries({ queryKey: ["cart-summary"] })
                    queryClient.invalidateQueries({ queryKey: ["cart", "list"] })
                    queryClient.invalidateQueries({
                        queryKey: ["artist-earnings"],
                    })
                    queryClient.invalidateQueries({ queryKey: ["earnings"] })
                    queryClient.invalidateQueries({
                        queryKey: ["user-transactions"],
                    })
                    queryClient.invalidateQueries({
                        queryKey: ["user-transaction-stats"],
                    })

                    await afterSuccess(data)
                } else {
                    const msg = data.message || "Payment verification failed"
                    sessionStorage.setItem(storageKey, `failed:${msg}`)
                    setVerificationStatus("failed")
                    setVerificationError(msg)
                    toast.error(
                        "Payment verification failed. Please contact support.",
                    )
                }
            } catch (error: unknown) {
                if (cancelled) return
                const err = error as {
                    response?: { data?: { message?: string } }
                    message?: string
                }
                const errorMessage =
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to verify payment"
                sessionStorage.setItem(storageKey, `failed:${errorMessage}`)
                setVerificationStatus("failed")
                setVerificationError(errorMessage)
                toast.error("Failed to verify payment. Please contact support.")
            }
        }

        void run()

        return () => {
            cancelled = true
        }
    }, [txRef, provider, verifyPayment, queryClient, orderId])

    if (
        verificationStatus === "pending" ||
        verificationStatus === "continuing"
    ) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
                <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
                    <div className="mb-6">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                        </div>
                        <h1 className="mb-2 font-bold text-2xl text-gray-900">
                            {verificationStatus === "continuing"
                                ? "Continuing checkout…"
                                : "Verifying Payment..."}
                        </h1>
                        <p className="text-gray-600">
                            {verificationStatus === "continuing"
                                ? "This seller is paid. Redirecting to the next seller payment."
                                : "Please wait while we verify your payment. This can take a few seconds with PayPal."}
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    if (verificationStatus === "failed") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
                <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
                    <div className="mb-6">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                            <XCircle className="h-10 w-10 text-red-600" />
                        </div>
                        <h1 className="mb-2 font-bold text-2xl text-gray-900">
                            Payment Verification Failed
                        </h1>
                        <p className="mb-4 text-gray-600">
                            {verificationError ||
                                "We couldn't verify your payment. Please contact support with your transaction reference."}
                        </p>
                        {txRef && (
                            <div className="mb-6 rounded-lg bg-gray-50 p-4">
                                <p className="mb-1 text-gray-600 text-sm">
                                    Transaction Reference
                                </p>
                                <p className="font-mono font-semibold text-gray-900 text-sm">
                                    {txRef}
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="space-y-3">
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => navigate("/orders")}
                        >
                            View My Orders
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => navigate("/buyart")}
                        >
                            Continue Shopping
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
                <div className="mb-6">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h1 className="mb-2 font-bold text-2xl text-gray-900">
                        Payment Successful!
                    </h1>
                    <p className="text-gray-600">
                        Thank you for your purchase. Your order has been received
                        and is being processed.
                    </p>
                </div>

                {resolvedOrderId && (
                    <div className="mb-6 rounded-lg bg-gray-50 p-4">
                        <p className="mb-1 text-gray-600 text-sm">Order ID</p>
                        <p className="font-mono font-semibold text-gray-900 text-sm">
                            {resolvedOrderId}
                        </p>
                    </div>
                )}

                {txRef && (
                    <div className="mb-6 rounded-lg bg-gray-50 p-4">
                        <p className="mb-1 text-gray-600 text-sm">
                            Transaction Reference
                        </p>
                        <p className="font-mono font-semibold text-gray-900 text-sm">
                            {txRef}
                        </p>
                    </div>
                )}

                <div className="space-y-3">
                    <p className="text-gray-600 text-sm">
                        You will receive an email confirmation shortly with your
                        order details.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Button
                            asChild
                            className="w-full bg-red-700 text-white hover:bg-red-800"
                        >
                            <Link to="/orders">
                                View My Orders
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => navigate("/buyart")}
                        >
                            Continue Shopping
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
