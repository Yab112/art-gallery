import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import {
    type PayoutProvider,
    useConnectPayoutCapability,
    useDisconnectPayoutCapability,
    useGetChapaBanks,
    usePayoutCapabilities,
} from "@/services/settings/usePayoutCapabilities"
import { AlertCircle, Check, Link2Off, Save } from "lucide-react"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function BillingPaymentsSection() {
    const { data: capabilities = [], isLoading, error } = usePayoutCapabilities()
    const { mutate: connect, isPending: isConnecting, variables: connectingVars } =
        useConnectPayoutCapability()
    const { mutate: disconnect, isPending: isDisconnecting, variables: disconnectingProvider } =
        useDisconnectPayoutCapability()
    const { data: chapaBanks, isLoading: isLoadingBanks } = useGetChapaBanks()

    const [paypalEmail, setPaypalEmail] = useState("")
    const [chapaForm, setChapaForm] = useState({
        chapaAccountName: "",
        chapaAccountNumber: "",
        chapaBankCode: "",
    })
    const [activePanel, setActivePanel] = useState<PayoutProvider | null>(null)

    const paypalCap = capabilities.find((c) => c.provider === "paypal")
    const chapaCap = capabilities.find((c) => c.provider === "chapa")
    const selectedChapaBank = (chapaBanks || []).find(
        (b) => b.code === chapaForm.chapaBankCode,
    )

    const handleConnectPaypal = () => {
        connect(
            { provider: "paypal", paypalEmail },
            { onSuccess: () => setActivePanel(null) },
        )
    }

    const handleConnectChapa = () => {
        connect(
            {
                provider: "chapa",
                chapaAccountName: chapaForm.chapaAccountName,
                chapaAccountNumber: chapaForm.chapaAccountNumber,
                chapaBankCode: chapaForm.chapaBankCode,
            },
            { onSuccess: () => setActivePanel(null) },
        )
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
                title="Error Loading Payout Methods"
                description="Failed to load your payout capabilities. Please try again later."
            />
        )
    }

    const rows: {
        id: PayoutProvider
        label: string
        subtitle: string
        connected: boolean
        detail?: string | null
        logo: string
    }[] = [
        {
            id: "paypal",
            label: "PayPal",
            subtitle: "Receive and withdraw USD earnings",
            connected: Boolean(paypalCap),
            detail: paypalCap?.paypalEmail,
            logo: "/paypal.png",
        },
        {
            id: "chapa",
            label: "Chapa",
            subtitle: "Receive and withdraw ETB earnings",
            connected: Boolean(chapaCap),
            detail: chapaCap
                ? `${chapaCap.chapaAccountName || ""} · ${chapaCap.chapaAccountNumber || ""}`
                : null,
            logo: "/chapa.png",
        },
    ]

    return (
        <div className="space-y-8 max-w-xl">
            <div className="space-y-2">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Payout capabilities
                </p>
                <p className="text-sm text-zinc-500 mb-3">
                    Connect one or more payout rails. Buyers can only pay with methods you can
                    receive. You cannot disconnect a rail while it has pending or withdrawable
                    balance.
                </p>
                <div className="divide-y divide-zinc-100 border border-zinc-100 rounded-lg overflow-hidden">
                    {rows.map((m) => {
                        const isBusyConnect =
                            isConnecting && connectingVars?.provider === m.id
                        const isBusyDisconnect =
                            isDisconnecting && disconnectingProvider === m.id
                        const isExpanded = activePanel === m.id && !m.connected

                        return (
                            <div key={m.id} className="bg-white">
                                <div className="flex items-center gap-4 px-4 py-3.5">
                                    <div className="flex-shrink-0 w-16 flex items-center">
                                        <img
                                            src={m.logo}
                                            alt={m.label}
                                            className="h-5 w-auto object-contain"
                                            onError={(e) => {
                                                const el = e.currentTarget
                                                el.style.display = "none"
                                                const fallback =
                                                    el.nextElementSibling as HTMLElement | null
                                                fallback?.classList.remove("hidden")
                                            }}
                                        />
                                        <span className="hidden text-xs font-semibold text-zinc-600">
                                            {m.label}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-zinc-900">
                                            {m.label}
                                        </p>
                                        <p className="text-xs text-zinc-400 mt-0.5">
                                            {m.subtitle}
                                        </p>
                                        {m.connected && m.detail && (
                                            <p className="text-xs text-zinc-600 mt-1 truncate">
                                                {m.detail}
                                            </p>
                                        )}
                                    </div>
                                    {m.connected ? (
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-900 uppercase tracking-wider">
                                                <Check className="h-3 w-3" />
                                                Connected
                                            </span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                disabled={isBusyDisconnect}
                                                onClick={() => disconnect(m.id)}
                                                className="text-xs text-red-700 hover:text-red-800 hover:bg-red-50"
                                            >
                                                <Link2Off className="h-3.5 w-3.5 mr-1" />
                                                {isBusyDisconnect ? "…" : "Disconnect"}
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            type="button"
                                            size="sm"
                                            disabled={isBusyConnect}
                                            onClick={() =>
                                                setActivePanel((p) =>
                                                    p === m.id ? null : m.id,
                                                )
                                            }
                                            className="flex-shrink-0 text-xs bg-black text-white hover:bg-zinc-800"
                                        >
                                            {isExpanded ? "Cancel" : "Connect"}
                                        </Button>
                                    )}
                                </div>

                                {isExpanded && m.id === "paypal" && (
                                    <div className="space-y-3 border-t border-zinc-50 bg-zinc-50/60 px-4 py-4">
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="paypalEmail"
                                                className="text-sm text-zinc-700"
                                            >
                                                PayPal Email Address
                                            </Label>
                                            <Input
                                                id="paypalEmail"
                                                type="email"
                                                placeholder="e.g. artist@example.com"
                                                value={paypalEmail}
                                                onChange={(e) =>
                                                    setPaypalEmail(e.target.value)
                                                }
                                                className="bg-white"
                                            />
                                            <p className="text-xs text-zinc-400">
                                                Earnings settle to this PayPal account in USD.
                                            </p>
                                        </div>
                                        <div className="flex justify-end">
                                            <Button
                                                type="button"
                                                disabled={
                                                    isConnecting || !paypalEmail.trim()
                                                }
                                                onClick={handleConnectPaypal}
                                                className="flex items-center gap-2 bg-black text-white hover:bg-zinc-800 text-xs"
                                            >
                                                <Save className="h-3.5 w-3.5" />
                                                {isConnecting
                                                    ? "Connecting…"
                                                    : "Connect PayPal"}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {isExpanded && m.id === "chapa" && (
                                    <div className="space-y-3 border-t border-zinc-50 bg-zinc-50/60 px-4 py-4">
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="chapaBankCode"
                                                className="text-sm text-zinc-700"
                                            >
                                                Bank / Wallet
                                            </Label>
                                            <Select
                                                value={
                                                    chapaForm.chapaBankCode || undefined
                                                }
                                                onValueChange={(val) =>
                                                    setChapaForm({
                                                        chapaBankCode: val,
                                                        chapaAccountName: "",
                                                        chapaAccountNumber: "",
                                                    })
                                                }
                                            >
                                                <SelectTrigger
                                                    id="chapaBankCode"
                                                    className="w-full text-black bg-white border border-zinc-200"
                                                >
                                                    <SelectValue placeholder="Select bank or wallet" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {isLoadingBanks ? (
                                                        <div className="p-2 text-xs text-zinc-500 text-center">
                                                            Loading banks from Chapa…
                                                        </div>
                                                    ) : (chapaBanks || []).length ===
                                                      0 ? (
                                                        <div className="p-2 text-xs text-zinc-500 text-center">
                                                            No banks available from Chapa
                                                        </div>
                                                    ) : (
                                                        (chapaBanks || []).map((bank) => (
                                                            <SelectItem
                                                                key={bank.id}
                                                                value={bank.code}
                                                            >
                                                                {bank.name}
                                                                {bank.isMobileMoney
                                                                    ? " · Mobile money"
                                                                    : ""}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {selectedChapaBank && (
                                            <>
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="chapaAccountName"
                                                        className="text-sm text-zinc-700"
                                                    >
                                                        Account Holder Name
                                                    </Label>
                                                    <Input
                                                        id="chapaAccountName"
                                                        placeholder="e.g. Abebe Kebede"
                                                        value={chapaForm.chapaAccountName}
                                                        onChange={(e) =>
                                                            setChapaForm({
                                                                ...chapaForm,
                                                                chapaAccountName:
                                                                    e.target.value,
                                                            })
                                                        }
                                                        className="bg-white"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="chapaAccountNumber"
                                                        className="text-sm text-zinc-700"
                                                    >
                                                        {selectedChapaBank.isMobileMoney
                                                            ? "Phone Number"
                                                            : "Account Number"}
                                                    </Label>
                                                    <Input
                                                        id="chapaAccountNumber"
                                                        placeholder={
                                                            selectedChapaBank.isMobileMoney
                                                                ? "e.g. 0911234567"
                                                                : "e.g. 1000123456789"
                                                        }
                                                        value={
                                                            chapaForm.chapaAccountNumber
                                                        }
                                                        onChange={(e) =>
                                                            setChapaForm({
                                                                ...chapaForm,
                                                                chapaAccountNumber:
                                                                    e.target.value,
                                                            })
                                                        }
                                                        className="bg-white"
                                                    />
                                                    {selectedChapaBank.accountLength !=
                                                        null && (
                                                        <p className="text-xs text-zinc-400">
                                                            Expected length:{" "}
                                                            {
                                                                selectedChapaBank.accountLength
                                                            }{" "}
                                                            digits
                                                        </p>
                                                    )}
                                                </div>
                                                <p className="text-xs text-zinc-400">
                                                    Earnings settle to this Chapa account
                                                    in ETB.
                                                </p>
                                                <div className="flex justify-end">
                                                    <Button
                                                        type="button"
                                                        disabled={
                                                            isConnecting ||
                                                            !chapaForm.chapaAccountName.trim() ||
                                                            !chapaForm.chapaAccountNumber.trim() ||
                                                            !chapaForm.chapaBankCode.trim()
                                                        }
                                                        onClick={handleConnectChapa}
                                                        className="flex items-center gap-2 bg-black text-white hover:bg-zinc-800 text-xs"
                                                    >
                                                        <Save className="h-3.5 w-3.5" />
                                                        {isConnecting
                                                            ? "Connecting…"
                                                            : "Connect Chapa"}
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
