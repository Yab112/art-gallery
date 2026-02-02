import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useVerifyPayment } from "@/services/payment/useVerifyPayment"
import { useQueryClient } from "@tanstack/react-query"
import { ArrowRight, CheckCircle, Loader2, XCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Link } from "react-router-dom"
import { toast } from "sonner"

export default function PaymentSuccessPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const queryClient = useQueryClient()
    const { user } = useAuth()
    const orderId = searchParams.get("orderId")
    // PayPal returns 'token' instead of 'txRef', so check both
    const txRef = searchParams.get("txRef") || searchParams.get("token")
    const provider = searchParams.get("provider") || "chapa" // Default to chapa if not specified

    const { mutate: verifyPayment, isPending: isVerifying } = useVerifyPayment()
    const [verificationStatus, setVerificationStatus] = useState<"pending" | "success" | "failed">(
        "pending"
    )
    const [verificationError, setVerificationError] = useState<string | null>(null)

    useEffect(() => {
        // Verify payment when page loads if txRef is available
        if (txRef && provider) {
            verifyPayment(
                {
                    provider: provider as "chapa" | "paypal",
                    txRef
                },
                {
                    onSuccess: (data) => {
                        if (data.success && data.data.status === "success") {
                            setVerificationStatus("success")
                            toast.success("Payment verified successfully!")

                            // Invalidate orders cache to refresh the orders list
                            // Uses authenticated user ID from session, not email
                            queryClient.invalidateQueries({
                                queryKey: ["user-orders"]
                            })
                            // Invalidate all cart-related queries
                            queryClient.invalidateQueries({
                                queryKey: ["cart"]
                            })
                            // Also invalidate cart summary specifically
                            queryClient.invalidateQueries({
                                queryKey: ["cart-summary"]
                            })
                            // Invalidate cart items list
                            queryClient.invalidateQueries({
                                queryKey: ["cart", "list"]
                            })
                            // Invalidate earnings (for sellers - earnings update when order completes)
                            queryClient.invalidateQueries({
                                queryKey: ["artist-earnings"]
                            })
                            queryClient.invalidateQueries({
                                queryKey: ["earnings"]
                            })
                            // Invalidate transactions (new transaction created for buyer)
                            queryClient.invalidateQueries({
                                queryKey: ["user-transactions"]
                            })
                            // Invalidate transaction stats
                            queryClient.invalidateQueries({
                                queryKey: ["user-transaction-stats"]
                            })
                        } else {
                            setVerificationStatus("failed")
                            setVerificationError(data.message || "Payment verification failed")
                            toast.error("Payment verification failed. Please contact support.")
                        }
                    },
                    onError: (error: any) => {
                        setVerificationStatus("failed")
                        const errorMessage =
                            error?.response?.data?.message ||
                            error?.message ||
                            "Failed to verify payment"
                        setVerificationError(errorMessage)
                        toast.error("Failed to verify payment. Please contact support.")
                    }
                }
            )
        } else {
            // If no txRef, mark as failed
            setVerificationStatus("failed")
            setVerificationError("Transaction reference not found")
        }
    }, [txRef, provider, verifyPayment])

    // Show loading state while verifying
    if (isVerifying || verificationStatus === "pending") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
                <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
                    <div className="mb-6">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                        </div>
                        <h1 className="mb-2 font-bold text-2xl text-gray-900">
                            Verifying Payment...
                        </h1>
                        <p className="text-gray-600">Please wait while we verify your payment.</p>
                    </div>
                </div>
            </div>
        )
    }

    // Show error state if verification failed
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
                                <p className="mb-1 text-gray-600 text-sm">Transaction Reference</p>
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

    // Show success state
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
                <div className="mb-6">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h1 className="mb-2 font-bold text-2xl text-gray-900">Payment Successful!</h1>
                    <p className="text-gray-600">
                        Thank you for your purchase. Your order has been received and is being
                        processed.
                    </p>
                </div>

                {orderId && (
                    <div className="mb-6 rounded-lg bg-gray-50 p-4">
                        <p className="mb-1 text-gray-600 text-sm">Order ID</p>
                        <p className="font-mono font-semibold text-gray-900 text-sm">{orderId}</p>
                    </div>
                )}

                {txRef && (
                    <div className="mb-6 rounded-lg bg-gray-50 p-4">
                        <p className="mb-1 text-gray-600 text-sm">Transaction Reference</p>
                        <p className="font-mono font-semibold text-gray-900 text-sm">{txRef}</p>
                    </div>
                )}

                <div className="space-y-3">
                    <p className="text-gray-600 text-sm">
                        You will receive an email confirmation shortly with your order details.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Button asChild className="w-full bg-red-700 text-white hover:bg-red-800">
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
