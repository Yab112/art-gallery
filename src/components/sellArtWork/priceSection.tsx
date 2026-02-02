"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { PRICE_NEGOTIATION_OPTIONS, TAX_RATE } from "@/lib/constants/srtsell.constant"
import type { ArtworkFormData } from "@/lib/schemas/artwork.schema"
import { usePlatformSettings } from "@/queries/settingsQueries"
import { type Control, Controller, type FieldErrors } from "react-hook-form"

interface PriceSectionProps {
    control: Control<ArtworkFormData>
    errors: FieldErrors<ArtworkFormData>
    formData: ArtworkFormData
}

export function PriceSection({ control, errors, formData }: PriceSectionProps) {
    const {
        data: platformSettings,
        isLoading: isLoadingSettings,
        isError: isSettingsError
    } = usePlatformSettings()
    const commissionRate =
        platformSettings?.settings?.platformCommissionRate != null
            ? platformSettings.settings.platformCommissionRate / 100
            : null

    const calculateNetPrice = (): number | null => {
        if (commissionRate == null) return null
        const priceStr = formData.desiredPrice?.replace(/[$,]/g, "") || "0"
        const price = Number.parseFloat(priceStr) || 0
        const commission = price * commissionRate
        const taxes = price * TAX_RATE
        return price - commission - taxes
    }

    // Format number with dollar sign and commas
    const formatCurrency = (value: string): string => {
        // Remove all non-numeric characters except decimal point
        const numericValue = value.replace(/[^0-9.]/g, "")
        if (!numericValue) return ""

        // Split by decimal point
        const parts = numericValue.split(".")
        const integerPart = parts[0] || ""
        const decimalPart = parts[1] || ""

        // Add commas to integer part
        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",")

        // Combine with dollar sign
        if (decimalPart) {
            return `$${formattedInteger}.${decimalPart}`
        }
        return formattedInteger ? `$${formattedInteger}` : ""
    }

    // Parse currency value (remove $ and commas)
    const parseCurrency = (value: string): string => {
        return value.replace(/[$,]/g, "")
    }

    return (
        <div className="space-y-6">
            <h3 className="font-semibold text-xl">4/ Price*</h3>
            <p className="text-muted-foreground text-sm">
                What price would you like to sell your piece for? Find out how much money you will
                receive after Artopia's commission is deducted.
            </p>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="desiredPrice">
                        Desired price (in $) <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                        name="desiredPrice"
                        control={control}
                        render={({ field }) => {
                            const displayValue = field.value ? formatCurrency(field.value) : ""

                            return (
                                <div className="relative">
                                    <Input
                                        id="desiredPrice"
                                        type="text"
                                        value={displayValue}
                                        onChange={(e) => {
                                            const rawValue = parseCurrency(e.target.value)
                                            field.onChange(rawValue)
                                        }}
                                        onBlur={field.onBlur}
                                        placeholder="$0.00"
                                        className="pl-8"
                                    />
                                    <span className="-translate-y-1/2 absolute top-1/2 left-3 transform text-gray-500">
                                        $
                                    </span>
                                </div>
                            )
                        }}
                    />
                    {errors.desiredPrice && (
                        <p className="text-destructive text-sm">{errors.desiredPrice.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>
                        For you
                        {commissionRate != null
                            ? ` (commission ${Math.round(commissionRate * 100)}%)`
                            : ""}
                    </Label>
                    <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                        <p className="text-gray-700 text-sm">
                            {commissionRate != null ? (
                                <>
                                    $
                                    {(calculateNetPrice() ?? 0).toLocaleString("en-US", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                </>
                            ) : isLoadingSettings ? (
                                <span className="text-muted-foreground">Loading…</span>
                            ) : isSettingsError ? (
                                <span className="text-muted-foreground">Unavailable</span>
                            ) : (
                                <span className="text-muted-foreground">—</span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="acceptPriceNegotiation">
                    Accept price negotiation <span className="text-destructive">*</span>
                </Label>
                <Controller
                    name="acceptPriceNegotiation"
                    control={control}
                    render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger id="acceptPriceNegotiation">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                {PRICE_NEGOTIATION_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.acceptPriceNegotiation && (
                    <p className="text-destructive text-sm">
                        {errors.acceptPriceNegotiation.message}
                    </p>
                )}
            </div>
        </div>
    )
}
