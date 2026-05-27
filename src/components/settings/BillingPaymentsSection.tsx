import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import {
    type PaymentMethod,
    useGetPaymentMethodPreference,
    useUpdatePaymentMethodPreference
} from "@/services/settings/usePaymentMethodPreference"
import { AlertCircle, Check, Save } from "lucide-react"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function BillingPaymentsSection() {
    const { data, isLoading, error } = useGetPaymentMethodPreference()
    const { mutate: updatePreference, isPending, variables: pendingVars } = useUpdatePaymentMethodPreference()
    const { data: chapaBanks, isLoading: isLoadingBanks } = useGetChapaBanks()

    const [formData, setFormData] = useState({
        paypalEmail: "",
        chapaAccountName: "",
        chapaAccountNumber: "",
        chapaBankCode: ""
    })

    useEffect(() => {
        if (data) {
            setFormData({
                paypalEmail: data.paypalEmail || "",
                chapaAccountName: data.chapaAccountName || "",
                chapaAccountNumber: data.chapaAccountNumber || "",
                chapaBankCode: data.chapaBankCode || ""
            })
        }
    }, [data])

    const currentMethod: PaymentMethod = (pendingVars?.method ?? data?.method ?? "paypal") as PaymentMethod

    const handleSelectMethod = (method: PaymentMethod) => {
        if (method === currentMethod) return
        updatePreference({
            method,
            paypalEmail: formData.paypalEmail,
            chapaAccountName: formData.chapaAccountName,
            chapaAccountNumber: formData.chapaAccountNumber,
            chapaBankCode: formData.chapaBankCode
        } as any)
    }

    const handleSave = () => {
        updatePreference({
            method: currentMethod,
            paypalEmail: formData.paypalEmail,
            chapaAccountName: formData.chapaAccountName,
            chapaAccountNumber: formData.chapaAccountNumber,
            chapaBankCode: formData.chapaBankCode
        } as any)
    }

    if (isLoading) {
        return (
            <div className="space-y-4 max-w-xl">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        )
    }

    if (error) {
        return (
            <EmptyState
                icon={AlertCircle}
                title="Error Loading Payment Methods"
                description="Failed to load your payment method preferences. Please try again later."
            />
        )
    }

    const methods = [
        {
            id: "paypal" as PaymentMethod,
            label: "PayPal",
            subtitle: "International payouts via PayPal balance",
            logo: (
                <img
                    src="/paypal.png"
                    alt="PayPal"
                    className="h-5 w-auto object-contain"
                />
            )
        },
        {
            id: "chapa" as PaymentMethod,
            label: "Chapa",
            subtitle: "Local payouts via mobile money or bank transfer",
            logo: (
                <img
                    src="/chapa.png"
                    alt="Chapa"
                    className="h-5 w-auto object-contain"
                    onError={(e) => {
                        // fallback text if logo not found
                        const el = e.currentTarget as HTMLImageElement
                        el.style.display = "none"
                        el.nextElementSibling?.classList.remove("hidden")
                    }}
                />
            )
        }
    ]

    return (
        <div className="space-y-8 max-w-xl">
            {/* Method selector */}
            <div className="space-y-2">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                    Payout Method
                </p>
                <div className="divide-y divide-zinc-100 border border-zinc-100 rounded-lg overflow-hidden">
                    {methods.map((m) => {
                        const isActive = currentMethod === m.id
                        const isPendingThis = isPending && pendingVars?.method === m.id
                        return (
                            <button
                                key={m.id}
                                type="button"
                                onClick={() => handleSelectMethod(m.id)}
                                className={`w-full flex items-center gap-4 px-4 py-3.5 text-left transition-colors ${
                                    isActive
                                        ? "bg-zinc-50"
                                        : "bg-white hover:bg-zinc-50/50"
                                }`}
                            >
                                {/* Radio indicator */}
                                <div
                                    className={`flex-shrink-0 h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                                        isActive
                                            ? "border-black bg-black"
                                            : "border-zinc-300 bg-white"
                                    }`}
                                >
                                    {isActive && (
                                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                    )}
                                </div>

                                {/* Logo */}
                                <div className="flex-shrink-0 w-16 flex items-center">
                                    {m.logo}
                                    <span className="hidden text-xs font-semibold text-zinc-600">{m.label}</span>
                                </div>

                                {/* Labels */}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium ${isActive ? "text-zinc-900" : "text-zinc-600"}`}>
                                        {m.label}
                                    </p>
                                    <p className="text-xs text-zinc-400 mt-0.5">{m.subtitle}</p>
                                </div>

                                {/* Active badge */}
                                {isActive && !isPendingThis && (
                                    <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold text-zinc-900 uppercase tracking-wider">
                                        <Check className="h-3 w-3" />
                                        Active
                                    </span>
                                )}
                                {isPendingThis && (
                                    <span className="flex-shrink-0 text-[10px] text-zinc-400 animate-pulse">
                                        Saving…
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Account details form */}
            <div className="space-y-4">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    {currentMethod === "paypal" ? "PayPal" : "Chapa"} Account Details
                </p>

                {currentMethod === "paypal" ? (
                    <div className="space-y-2">
                        <Label htmlFor="paypalEmail" className="text-sm text-zinc-700">
                            PayPal Email Address
                        </Label>
                        <Input
                            id="paypalEmail"
                            type="email"
                            placeholder="e.g. artist@example.com"
                            value={formData.paypalEmail}
                            onChange={(e) =>
                                setFormData({ ...formData, paypalEmail: e.target.value })
                            }
                        />
                        <p className="text-xs text-zinc-400">
                            Earnings will be sent to this PayPal account in USD.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="chapaAccountName" className="text-sm text-zinc-700">
                                Account Holder Name
                            </Label>
                            <Input
                                id="chapaAccountName"
                                placeholder="e.g. Abebe Kebede"
                                value={formData.chapaAccountName}
                                onChange={(e) =>
                                    setFormData({ ...formData, chapaAccountName: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="chapaAccountNumber" className="text-sm text-zinc-700">
                                Account / Phone Number
                            </Label>
                            <Input
                                id="chapaAccountNumber"
                                placeholder="e.g. 1000123456789 or 0911234567"
                                value={formData.chapaAccountNumber}
                                onChange={(e) =>
                                    setFormData({ ...formData, chapaAccountNumber: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="chapaBankCode" className="text-sm text-zinc-700">
                                Bank / Wallet
                            </Label>
                            <Select
                                value={formData.chapaBankCode}
                                onValueChange={(val) =>
                                    setFormData({ ...formData, chapaBankCode: val })
                                }
                            >
                                <SelectTrigger id="chapaBankCode" className="w-full text-black bg-white border border-zinc-200">
                                    <SelectValue placeholder="Select bank or wallet" />
                                </SelectTrigger>
                                <SelectContent>
                                    {isLoadingBanks ? (
                                        <div className="p-2 text-xs text-zinc-500 text-center">Loading banks...</div>
                                    ) : (chapaBanks || []).length === 0 ? (
                                        <div className="p-2 text-xs text-zinc-500 text-center">No banks available</div>
                                    ) : (
                                        (chapaBanks || []).map((bank) => (
                                            <SelectItem key={bank.id} value={bank.code}>
                                                {bank.name} ({bank.code})
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <p className="text-xs text-zinc-400">
                            Earnings will be sent to this Chapa account in ETB.
                        </p>
                    </div>
                )}

                <div className="flex justify-end pt-2">
                    <Button
                        type="button"
                        disabled={isPending}
                        onClick={handleSave}
                        className="flex items-center gap-2 bg-black text-white hover:bg-zinc-800 transition-all rounded-lg text-xs py-2 px-4"
                    >
                        <Save className="h-3.5 w-3.5" />
                        {isPending ? "Saving…" : "Save Details"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
