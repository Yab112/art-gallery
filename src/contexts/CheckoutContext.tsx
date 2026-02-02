import { type ReactNode, createContext, useContext, useState } from "react"

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

interface PaymentData {
    provider: "chapa" | "paypal" | "card"
    phoneNumber?: string
}

interface CheckoutContextType {
    shippingData: ShippingData | null
    paymentData: PaymentData | null
    selectedCartItemIds: Set<string>
    setShippingData: (data: ShippingData) => void
    setPaymentData: (data: PaymentData) => void
    setSelectedCartItemIds: (ids: Set<string> | ((prev: Set<string>) => Set<string>)) => void
    clearCheckout: () => void
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined)

export function CheckoutProvider({ children }: { children: ReactNode }) {
    const [shippingData, setShippingData] = useState<ShippingData | null>(null)
    const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
    const [selectedCartItemIds, setSelectedCartItemIds] = useState<Set<string>>(new Set())

    const clearCheckout = () => {
        setShippingData(null)
        setPaymentData(null)
        setSelectedCartItemIds(new Set())
    }

    return (
        <CheckoutContext.Provider
            value={{
                shippingData,
                paymentData,
                selectedCartItemIds,
                setShippingData,
                setPaymentData,
                setSelectedCartItemIds,
                clearCheckout
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
