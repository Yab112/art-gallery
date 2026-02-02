import { Button } from "@/components/ui/button"
// import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCheckout } from "@/contexts/CheckoutContext"
import { useState } from "react"

interface ShippingInfoProps {
    onNext: () => void
}

export function ShippingInfo({ onNext }: ShippingInfoProps) {
    const { shippingData, setShippingData } = useCheckout()

    const [formData, setFormData] = useState({
        firstName: shippingData?.firstName || "",
        lastName: shippingData?.lastName || "",
        email: shippingData?.email || "",
        phone: shippingData?.phone || "",
        address: shippingData?.address || "",
        apartment: shippingData?.apartment || "",
        city: shippingData?.city || "",
        state: shippingData?.state || "",
        zipCode: shippingData?.zipCode || "",
        country: shippingData?.country || "United States",
        saveAddress: false
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }))
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
        if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
        if (!formData.email.trim()) newErrors.email = "Email is required"
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"
        if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
        if (!formData.address.trim()) newErrors.address = "Address is required"
        if (!formData.city.trim()) newErrors.city = "City is required"
        if (!formData.state.trim()) newErrors.state = "State is required"
        if (!formData.zipCode.trim()) newErrors.zipCode = "ZIP code is required"

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (validateForm()) {
            // Save shipping data to context
            setShippingData({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                apartment: formData.apartment,
                city: formData.city,
                state: formData.state,
                zipCode: formData.zipCode,
                country: formData.country
            })
            onNext()
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="mb-2 font-bold text-2xl text-gray-900">Shipping Information</h2>
                <p className="text-gray-600">
                    Enter your shipping details to continue with your order.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                            className={errors.firstName ? "border-red-500" : ""}
                        />
                        {errors.firstName && (
                            <p className="mt-1 text-red-500 text-sm">{errors.firstName}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                            className={errors.lastName ? "border-red-500" : ""}
                        />
                        {errors.lastName && (
                            <p className="mt-1 text-red-500 text-sm">{errors.lastName}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && (
                            <p className="mt-1 text-red-500 text-sm">{errors.email}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            className={errors.phone ? "border-red-500" : ""}
                        />
                        {errors.phone && (
                            <p className="mt-1 text-red-500 text-sm">{errors.phone}</p>
                        )}
                    </div>
                </div>

                {/* Address Information */}
                <div>
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        className={errors.address ? "border-red-500" : ""}
                        placeholder="123 Main Street"
                    />
                    {errors.address && (
                        <p className="mt-1 text-red-500 text-sm">{errors.address}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="apartment">Apartment, suite, etc. (optional)</Label>
                    <Input
                        id="apartment"
                        value={formData.apartment}
                        onChange={(e) => handleInputChange("apartment", e.target.value)}
                        placeholder="Apt 4B"
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => handleInputChange("city", e.target.value)}
                            className={errors.city ? "border-red-500" : ""}
                        />
                        {errors.city && <p className="mt-1 text-red-500 text-sm">{errors.city}</p>}
                    </div>
                    <div>
                        <Label htmlFor="state">State *</Label>
                        <Input
                            id="state"
                            value={formData.state}
                            onChange={(e) => handleInputChange("state", e.target.value)}
                            placeholder="e.g., California"
                            className={errors.state ? "border-red-500" : ""}
                        />
                        {errors.state && (
                            <p className="mt-1 text-red-500 text-sm">{errors.state}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="zipCode">ZIP Code *</Label>
                        <Input
                            id="zipCode"
                            value={formData.zipCode}
                            onChange={(e) => handleInputChange("zipCode", e.target.value)}
                            className={errors.zipCode ? "border-red-500" : ""}
                        />
                        {errors.zipCode && (
                            <p className="mt-1 text-red-500 text-sm">{errors.zipCode}</p>
                        )}
                    </div>
                </div>

                <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => handleInputChange("country", e.target.value)}
                        placeholder="e.g., United States"
                    />
                </div>

                {/* Save Address Checkbox */}
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="saveAddress"
                        checked={formData.saveAddress}
                        onCheckedChange={(checked) =>
                            handleInputChange("saveAddress", checked as boolean)
                        }
                    />
                    <Label htmlFor="saveAddress" className="text-gray-600 text-sm">
                        Save this address for future orders
                    </Label>
                </div>

                {/* Continue Button */}
                <div className="pt-6">
                    <Button type="submit" className="w-full bg-red-700 text-white hover:bg-red-800">
                        Continue to Payment
                    </Button>
                </div>
            </form>
        </div>
    )
}
