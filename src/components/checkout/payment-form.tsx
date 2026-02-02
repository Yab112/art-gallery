import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCheckout } from "@/contexts/CheckoutContext"
import { useGetPaymentMethodPreference } from "@/services/settings/usePaymentMethodPreference"
import { CreditCard, Lock } from "lucide-react"
import { useEffect, useState } from "react"
// import { StripePayment } from "./stripe-payment";

interface PaymentFormProps {
    onNext: () => void
    onPrevious: () => void
}

export function PaymentForm({ onNext, onPrevious }: PaymentFormProps) {
    const { paymentData, setPaymentData } = useCheckout()
    const { data: preference } = useGetPaymentMethodPreference()

    // Use user's preferred payment method as default, fallback to paymentData or 'paypal'
    const defaultMethod = preference?.paymentMethodPreference || paymentData?.provider || "paypal"
    const [paymentMethod, setPaymentMethod] = useState<"chapa" | "paypal" | "card">(
        defaultMethod as "chapa" | "paypal" | "card"
    )

    // Update payment method when preference loads
    useEffect(() => {
        if (preference?.paymentMethodPreference && !paymentData?.provider) {
            setPaymentMethod(preference.paymentMethodPreference as "chapa" | "paypal" | "card")
        }
    }, [preference, paymentData])
    const [formData, setFormData] = useState({
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        cardholderName: "",
        billingAddress: "",
        billingCity: "",
        billingState: "",
        billingZip: "",
        sameAsShipping: true,
        saveCard: false,
        phoneNumber: ""
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }))
        }
    }

    const formatCardNumber = (value: string) => {
        // Remove all non-digits
        const digits = value.replace(/\D/g, "")
        // Add spaces every 4 digits
        return digits.replace(/(\d{4})(?=\d)/g, "$1 ")
    }

    const formatExpiryDate = (value: string) => {
        // Remove all non-digits
        const digits = value.replace(/\D/g, "")
        // Add slash after 2 digits
        if (digits.length >= 2) {
            return `${digits.substring(0, 2)}/${digits.substring(2, 4)}`
        }
        return digits
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (paymentMethod === "card") {
            if (!formData.cardNumber.trim()) newErrors.cardNumber = "Card number is required"
            else if (formData.cardNumber.replace(/\s/g, "").length < 16)
                newErrors.cardNumber = "Card number must be 16 digits"

            if (!formData.expiryDate.trim()) newErrors.expiryDate = "Expiry date is required"
            else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate))
                newErrors.expiryDate = "Expiry date must be MM/YY format"

            if (!formData.cvv.trim()) newErrors.cvv = "CVV is required"
            else if (formData.cvv.length < 3) newErrors.cvv = "CVV must be at least 3 digits"

            if (!formData.cardholderName.trim())
                newErrors.cardholderName = "Cardholder name is required"
        }

        if (!formData.sameAsShipping) {
            if (!formData.billingAddress.trim())
                newErrors.billingAddress = "Billing address is required"
            if (!formData.billingCity.trim()) newErrors.billingCity = "Billing city is required"
            if (!formData.billingState.trim()) newErrors.billingState = "Billing state is required"
            if (!formData.billingZip.trim()) newErrors.billingZip = "Billing ZIP code is required"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (validateForm()) {
            // Save payment data to context
            setPaymentData({
                provider: paymentMethod as "chapa" | "paypal" | "card",
                phoneNumber: formData.phoneNumber
            })
            onNext()
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="mb-2 font-bold text-2xl text-gray-900">Payment Information</h2>
                <p className="text-gray-600">
                    Choose your preferred payment method and enter your details.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Payment Method Selection */}
                <div>
                    <Label className="font-medium text-base">Payment Method</Label>
                    <div className="mt-3 space-y-3">
                        <div className="flex items-center space-x-3">
                            <input
                                type="radio"
                                id="chapa"
                                name="paymentMethod"
                                value="chapa"
                                checked={paymentMethod === "chapa"}
                                onChange={(e) =>
                                    setPaymentMethod(e.target.value as "chapa" | "paypal" | "card")
                                }
                                className="h-4 w-4 border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <Label
                                htmlFor="chapa"
                                className="flex cursor-pointer items-center gap-2"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#00A86B">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                                </svg>
                                Chapa (Mobile Money, Bank Transfer)
                            </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                            <input
                                type="radio"
                                id="paypal"
                                name="paymentMethod"
                                value="paypal"
                                checked={paymentMethod === "paypal"}
                                onChange={(e) =>
                                    setPaymentMethod(e.target.value as "chapa" | "paypal" | "card")
                                }
                                className="h-4 w-4 border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <Label htmlFor="paypal" className="cursor-pointer">
                                PayPal (International)
                            </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                            <input
                                type="radio"
                                id="card"
                                name="paymentMethod"
                                value="card"
                                checked={paymentMethod === "card"}
                                onChange={(e) =>
                                    setPaymentMethod(e.target.value as "chapa" | "paypal" | "card")
                                }
                                className="h-4 w-4 border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <Label
                                htmlFor="card"
                                className="flex cursor-pointer items-center gap-2"
                            >
                                <CreditCard className="h-4 w-4" />
                                Credit or Debit Card
                            </Label>
                        </div>
                    </div>
                </div>

                {paymentMethod === "chapa" && (
                    <div className="space-y-4">
                        <div className="rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-6">
                            <div className="flex items-start gap-3">
                                <div className="rounded-full bg-green-100 p-2">
                                    <svg
                                        className="h-6 w-6 text-green-600"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="mb-2 font-semibold text-green-900">
                                        Pay with Chapa - Ethiopia's Payment Gateway
                                    </h3>
                                    <p className="mb-3 text-green-700 text-sm">
                                        You'll be redirected to Chapa's secure checkout to complete
                                        your payment using:
                                    </p>
                                    <ul className="ml-4 list-disc space-y-1 text-green-700 text-sm">
                                        <li>Telebirr</li>
                                        <li>CBE Birr</li>
                                        <li>Local Bank Accounts</li>
                                        <li>International Cards (Visa, Mastercard)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                            <Input
                                id="phoneNumber"
                                type="tel"
                                value={formData.phoneNumber}
                                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                                placeholder="09XXXXXXXX or 07XXXXXXXX"
                                className="bg-white"
                            />
                            <p className="mt-1 text-gray-500 text-xs">
                                Providing your phone number helps speed up the payment process
                            </p>
                        </div>
                    </div>
                )}

                {paymentMethod === "card" && (
                    <>
                        {/* Card Information */}
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="cardNumber">Card Number *</Label>
                                <Input
                                    id="cardNumber"
                                    value={formData.cardNumber}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "cardNumber",
                                            formatCardNumber(e.target.value)
                                        )
                                    }
                                    placeholder="1234 5678 9012 3456"
                                    maxLength={19}
                                    className={errors.cardNumber ? "border-red-500" : ""}
                                />
                                {errors.cardNumber && (
                                    <p className="mt-1 text-red-500 text-sm">{errors.cardNumber}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="expiryDate">Expiry Date *</Label>
                                    <Input
                                        id="expiryDate"
                                        value={formData.expiryDate}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "expiryDate",
                                                formatExpiryDate(e.target.value)
                                            )
                                        }
                                        placeholder="MM/YY"
                                        maxLength={5}
                                        className={errors.expiryDate ? "border-red-500" : ""}
                                    />
                                    {errors.expiryDate && (
                                        <p className="mt-1 text-red-500 text-sm">
                                            {errors.expiryDate}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="cvv">CVV *</Label>
                                    <Input
                                        id="cvv"
                                        value={formData.cvv}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "cvv",
                                                e.target.value.replace(/\D/g, "")
                                            )
                                        }
                                        placeholder="123"
                                        maxLength={4}
                                        className={errors.cvv ? "border-red-500" : ""}
                                    />
                                    {errors.cvv && (
                                        <p className="mt-1 text-red-500 text-sm">{errors.cvv}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="cardholderName">Cardholder Name *</Label>
                                <Input
                                    id="cardholderName"
                                    value={formData.cardholderName}
                                    onChange={(e) =>
                                        handleInputChange("cardholderName", e.target.value)
                                    }
                                    placeholder="John Doe"
                                    className={errors.cardholderName ? "border-red-500" : ""}
                                />
                                {errors.cardholderName && (
                                    <p className="mt-1 text-red-500 text-sm">
                                        {errors.cardholderName}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Billing Address */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="sameAsShipping"
                                    checked={formData.sameAsShipping}
                                    onCheckedChange={(checked) =>
                                        handleInputChange("sameAsShipping", checked as boolean)
                                    }
                                />
                                <Label htmlFor="sameAsShipping" className="text-sm">
                                    Billing address same as shipping address
                                </Label>
                            </div>

                            {!formData.sameAsShipping && (
                                <div className="space-y-4 border-gray-200 border-l-2 pl-6">
                                    <div>
                                        <Label htmlFor="billingAddress">Billing Address *</Label>
                                        <Input
                                            id="billingAddress"
                                            value={formData.billingAddress}
                                            onChange={(e) =>
                                                handleInputChange("billingAddress", e.target.value)
                                            }
                                            className={
                                                errors.billingAddress ? "border-red-500" : ""
                                            }
                                        />
                                        {errors.billingAddress && (
                                            <p className="mt-1 text-red-500 text-sm">
                                                {errors.billingAddress}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="billingCity">City *</Label>
                                            <Input
                                                id="billingCity"
                                                value={formData.billingCity}
                                                onChange={(e) =>
                                                    handleInputChange("billingCity", e.target.value)
                                                }
                                                className={
                                                    errors.billingCity ? "border-red-500" : ""
                                                }
                                            />
                                            {errors.billingCity && (
                                                <p className="mt-1 text-red-500 text-sm">
                                                    {errors.billingCity}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="billingState">State *</Label>
                                            <Input
                                                id="billingState"
                                                value={formData.billingState}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "billingState",
                                                        e.target.value
                                                    )
                                                }
                                                className={
                                                    errors.billingState ? "border-red-500" : ""
                                                }
                                            />
                                            {errors.billingState && (
                                                <p className="mt-1 text-red-500 text-sm">
                                                    {errors.billingState}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="billingZip">ZIP Code *</Label>
                                        <Input
                                            id="billingZip"
                                            value={formData.billingZip}
                                            onChange={(e) =>
                                                handleInputChange("billingZip", e.target.value)
                                            }
                                            className={errors.billingZip ? "border-red-500" : ""}
                                        />
                                        {errors.billingZip && (
                                            <p className="mt-1 text-red-500 text-sm">
                                                {errors.billingZip}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Save Card Checkbox */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="saveCard"
                                checked={formData.saveCard}
                                onCheckedChange={(checked) =>
                                    handleInputChange("saveCard", checked as boolean)
                                }
                            />
                            <Label htmlFor="saveCard" className="text-gray-600 text-sm">
                                Save this card for future purchases
                            </Label>
                        </div>
                    </>
                )}

                {paymentMethod === "paypal" && (
                    <div className="space-y-4">
                        <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                            <div className="flex items-start gap-4">
                                <div className="rounded-full bg-white p-2 shadow-sm">
                                    <svg
                                        className="h-8 w-8"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
                                            fill="#003087"
                                        />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="mb-2 font-semibold text-blue-900 text-lg">
                                        International Payment via PayPal
                                    </h3>
                                    <p className="mb-4 text-blue-700 text-sm leading-relaxed">
                                        You've selected PayPal for your international transaction.
                                        Here's what will happen:
                                    </p>
                                    <ul className="mb-4 ml-4 list-disc space-y-2 text-blue-700 text-sm">
                                        <li>Securely login to your PayPal account</li>
                                        <li>
                                            Choose your preferred funding source (Balance, Bank, or
                                            Card)
                                        </li>
                                        <li>Review the currency conversion and total amount</li>
                                        <li>Instant verification and order processing</li>
                                    </ul>
                                    <p className="text-blue-600 text-xs italic">
                                        Note: You will be redirected to PayPal's secure portal after
                                        clicking "Continue to Review" and proceeding to the final
                                        step.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="mb-4 flex items-center justify-center gap-2 text-gray-500 text-sm">
                                <img src="/paypal.png" alt="PayPal" className="h-4 w-auto" />
                                Trusted by millions worldwide
                            </p>
                        </div>
                    </div>
                )}

                {/* Security Notice */}
                <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-4 text-gray-600 text-sm">
                    <Lock className="h-4 w-4 text-green-600" />
                    <span>
                        Your payment information is encrypted and secure. We never store your card
                        details.
                    </span>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4 pt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onPrevious}
                        className="flex-1 bg-white"
                    >
                        Previous
                    </Button>
                    <Button type="submit" className="flex-1 bg-red-700 text-white hover:bg-red-800">
                        Continue to Review
                    </Button>
                </div>
            </form>
        </div>
    )
}
