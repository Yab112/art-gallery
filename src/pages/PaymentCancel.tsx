import { Button } from "@/components/ui/button"
import { ArrowLeft, ShoppingCart, XCircle } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Link } from "react-router-dom"

export default function PaymentCancelPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const provider = searchParams.get("provider") || "unknown"
    const token = searchParams.get("token") // PayPal order ID if available

    const getProviderName = () => {
        switch (provider.toLowerCase()) {
            case "paypal":
                return "PayPal"
            case "chapa":
                return "Chapa"
            default:
                return "Payment Provider"
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
                <div className="mb-6">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                        <XCircle className="h-10 w-10 text-yellow-600" />
                    </div>
                    <h1 className="mb-2 font-bold text-2xl text-gray-900">Payment Cancelled</h1>
                    <p className="mb-4 text-gray-600">
                        Your payment with {getProviderName()} was cancelled. No charges have been
                        made to your account.
                    </p>
                    <p className="text-gray-500 text-sm">
                        You can try again or choose a different payment method.
                    </p>
                </div>

                {token && (
                    <div className="mb-6 rounded-lg bg-gray-50 p-4">
                        <p className="mb-1 text-gray-600 text-sm">Transaction ID</p>
                        <p className="font-mono font-semibold text-gray-900 text-sm">{token}</p>
                    </div>
                )}

                <div className="space-y-3">
                    <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <p className="text-blue-800 text-sm">
                            <strong>Note:</strong> Your order has been saved but is not yet paid.
                            You can complete the payment from your orders page.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button asChild className="w-full bg-red-700 text-white hover:bg-red-800">
                            <Link to="/checkout">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Try Payment Again
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => navigate("/orders")}
                        >
                            <ShoppingCart className="mr-2 h-4 w-4" />
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
        </div>
    )
}
