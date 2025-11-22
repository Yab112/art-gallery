import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ShippingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentData {
  provider: 'chapa' | 'paypal' | 'card';
  phoneNumber?: string;
}

interface CheckoutContextType {
  shippingData: ShippingData | null;
  paymentData: PaymentData | null;
  setShippingData: (data: ShippingData) => void;
  setPaymentData: (data: PaymentData) => void;
  resetCheckout: () => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const CheckoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [shippingData, setShippingData] = useState<ShippingData | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  const resetCheckout = () => {
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
        resetCheckout,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};
