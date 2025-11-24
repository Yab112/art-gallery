import { createContext, useContext, useState, ReactNode } from "react";

interface ShippingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

interface PaymentData {
  provider: 'chapa' | 'paypal' | 'card';
  phoneNumber?: string;
}

interface CheckoutContextType {
  shippingData: ShippingData | null;
  paymentData: PaymentData | null;
  setShippingData: (data: ShippingData) => void;
  setPaymentData: (data: PaymentData) => void;
  clearCheckout: () => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [shippingData, setShippingData] = useState<ShippingData | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  const clearCheckout = () => {
    setShippingData(null);
    setPaymentData(null);
  };

  return (
    <CheckoutContext.Provider
      value={{
        shippingData,
        paymentData,
        setShippingData,
        setPaymentData,
        clearCheckout,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
}

