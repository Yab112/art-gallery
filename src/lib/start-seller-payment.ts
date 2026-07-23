import { getApiBaseUrl } from "@/lib/api-config"
import type { PreparedOrder } from "@/services/checkout/usePrepareCheckout"
import axios from "axios"

/** Start gateway checkout for one prepared seller order (full-page redirect). */
export async function startPaymentForPreparedOrder(params: {
    order: PreparedOrder
    email: string
    firstName?: string
    lastName?: string
}) {
    const { order, email, firstName, lastName } = params
    const provider = String(order.paymentProvider || "").toLowerCase() as
        | "chapa"
        | "paypal"

    const quote = order.chargeQuote
    const currency = (quote?.chargedCurrency ||
        (order.currency === "ETB" ? "ETB" : "USD")) as "USD" | "ETB"
    const amount = Number(quote?.chargedAmount ?? order.totalAmount)

    if (provider !== "chapa" && provider !== "paypal") {
        throw new Error(`Unsupported payment provider: ${order.paymentProvider}`)
    }
    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error(`Invalid payment amount for order ${order.orderId}`)
    }

    if (quote?.expiresAt && new Date(quote.expiresAt).getTime() < Date.now()) {
        const err = new Error(
            "This payment quote has expired. Please place the order again to refresh the amount.",
        ) as Error & { code?: string }
        err.code = "QUOTE_EXPIRED"
        throw err
    }

    try {
        const response = await axios.post(
            `${getApiBaseUrl()}/api/payment/initialize`,
            {
                provider,
                amount,
                currency,
                email,
                firstName,
                lastName,
                txRef: order.txRef,
                orderId: order.orderId,
            },
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            },
        )

        const data = response.data
        const checkoutUrl = data?.data?.checkoutUrl
        if (!data?.success || !checkoutUrl) {
            throw new Error(data?.message || "Failed to initialize payment")
        }

        window.location.href = checkoutUrl
    } catch (error: any) {
        const body = error?.response?.data
        const code = body?.error || body?.message
        if (
            code === "QUOTE_EXPIRED" ||
            String(body?.message || "").includes("quote has expired")
        ) {
            const err = new Error(
                body?.message ||
                    "This payment quote has expired. Please place the order again to refresh the amount.",
            ) as Error & { code?: string }
            err.code = "QUOTE_EXPIRED"
            throw err
        }
        throw error
    }
}
