import { type ReactNode, createContext, useContext, useState, useCallback } from "react"
import type { SellerCheckoutState } from "@/lib/checkout-sellers"
import type { CheckoutPaymentMethod } from "@/services/checkout/useAvailableCheckoutMethods"

interface ShippingData {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    apartment?: string
    city: string
    state: string
    zipCode: string
    country?: string
}

export interface ShippingOption {
    serviceType: string
    serviceName: string
    totalCharge: number
    currency: string
    transitDays?: number
}

/** @deprecated Prefer per-seller paymentMethod on sellerCheckouts */
interface PaymentData {
    provider: "chapa" | "paypal" | "card"
}

interface CheckoutContextType {
    shippingData: ShippingData | null
    /** Legacy single-provider field — derived from first seller when possible */
    paymentData: PaymentData | null
    /** Legacy single shipping — not used for multi-seller; prefer sellerCheckouts */
    selectedShippingOption: ShippingOption | null
    selectedCartItemIds: Set<string>
    sellerCheckouts: Record<string, SellerCheckoutState>
    setShippingData: (data: ShippingData) => void
    setPaymentData: (data: PaymentData) => void
    setSelectedShippingOption: (option: ShippingOption | null) => void
    setSelectedCartItemIds: (ids: Set<string> | ((prev: Set<string>) => Set<string>)) => void
    setSellerPaymentMethod: (
        sellerId: string,
        method: CheckoutPaymentMethod | null,
    ) => void
    setSellerShippingOption: (
        sellerId: string,
        option: ShippingOption | null,
    ) => void
    ensureSellerCheckout: (sellerId: string) => void
    clearCheckout: () => void
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined)

const emptySellerState = (): SellerCheckoutState => ({
    paymentMethod: null,
    shippingOption: null,
})

export function CheckoutProvider({ children }: { children: ReactNode }) {
    const [shippingData, setShippingData] = useState<ShippingData | null>(null)
    const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
    const [selectedShippingOption, setSelectedShippingOption] =
        useState<ShippingOption | null>(null)
    const [selectedCartItemIds, setSelectedCartItemIds] = useState<Set<string>>(
        new Set(),
    )
    const [sellerCheckouts, setSellerCheckouts] = useState<
        Record<string, SellerCheckoutState>
    >({})

    const ensureSellerCheckout = useCallback((sellerId: string) => {
        setSellerCheckouts((prev) => {
            if (prev[sellerId]) return prev
            return { ...prev, [sellerId]: emptySellerState() }
        })
    }, [])

    const setSellerPaymentMethod = useCallback(
        (sellerId: string, method: CheckoutPaymentMethod | null) => {
            setSellerCheckouts((prev) => ({
                ...prev,
                [sellerId]: {
                    ...(prev[sellerId] || emptySellerState()),
                    paymentMethod: method,
                },
            }))
            if (method) {
                setPaymentData({ provider: method })
            }
        },
        [],
    )

    const setSellerShippingOption = useCallback(
        (sellerId: string, option: ShippingOption | null) => {
            setSellerCheckouts((prev) => ({
                ...prev,
                [sellerId]: {
                    ...(prev[sellerId] || emptySellerState()),
                    shippingOption: option,
                },
            }))
            setSelectedShippingOption(option)
        },
        [],
    )

    const clearCheckout = () => {
        setShippingData(null)
        setPaymentData(null)
        setSelectedShippingOption(null)
        setSelectedCartItemIds(new Set())
        setSellerCheckouts({})
    }

    return (
        <CheckoutContext.Provider
            value={{
                shippingData,
                paymentData,
                selectedShippingOption,
                selectedCartItemIds,
                sellerCheckouts,
                setShippingData,
                setPaymentData,
                setSelectedShippingOption,
                setSelectedCartItemIds,
                setSellerPaymentMethod,
                setSellerShippingOption,
                ensureSellerCheckout,
                clearCheckout,
            }}
        >
            {children}
        </CheckoutContext.Provider>
    )
}

export function useCheckout() {
    const context = useContext(CheckoutContext)
    if (context === undefined) {
        throw new Error("useCheckout must be used within a CheckoutProvider")
    }
    return context
}
