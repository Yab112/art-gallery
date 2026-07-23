import { ProtectedRoute } from "@/components/auth/protected-route"
import { OrdersSkeleton } from "@/components/skeletons/orders-skeleton"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { useUserOrders } from "@/queries/orderQueries"
import {
    ShoppingBag,
    ChevronDown,
    ChevronUp,
    Package,
    ExternalLink,
    Clock,
    CheckCircle2,
    Truck,
    AlertCircle,
    RefreshCw,
    ArrowRight,
} from "lucide-react"
import { useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { OrderShipment } from "@/queries/orderQueries"
import { useOrderShipment } from "@/services/fedex/useOrderShipment"
import { isValidFedExTrackingNumber } from "@/lib/utils/fedex"
import {
    getCustomerTrackingEvents,
    getFriendlyTrackingLabel,
} from "@/lib/shipment-tracking"
import { formatMoney, isFedExServiceType } from "@/lib/format-money"

const STATUS_STYLES: Record<
    string,
    { label: string; className: string; dotClassName: string }
> = {
    PENDING: {
        label: "Pending",
        className: "text-amber-700",
        dotClassName: "bg-amber-500",
    },
    PAID: {
        label: "Paid",
        className: "text-emerald-700",
        dotClassName: "bg-emerald-500",
    },
    COMPLETED: {
        label: "Completed",
        className: "text-zinc-700",
        dotClassName: "bg-zinc-400",
    },
    CANCELLED: {
        label: "Cancelled",
        className: "text-zinc-500",
        dotClassName: "bg-zinc-300",
    },
    REFUNDED: {
        label: "Refunded",
        className: "text-zinc-500",
        dotClassName: "bg-zinc-300",
    },
    DISPUTED: {
        label: "Disputed",
        className: "text-amber-700",
        dotClassName: "bg-amber-500",
    },
}

function formatDisputeReason(reason?: string | null): string | null {
    if (!reason) return null
    const labels: Record<string, string> = {
        NOT_RECEIVED: "Did not receive artwork",
        DAMAGED: "Artwork is damaged",
        WRONG_ITEM: "Received wrong artwork",
        NOT_AS_DESCRIBED: "Not as described",
        OTHER: "Other issue",
    }
    return labels[reason] || reason.replace(/_/g, " ").toLowerCase()
}

function StatusNote({
    tone = "muted",
    icon: Icon,
    noMargin = false,
    children,
}: {
    tone?: "muted" | "amber" | "green" | "red"
    icon: typeof Clock
    noMargin?: boolean
    children: ReactNode
}) {
    const tones = {
        muted: "text-zinc-500",
        amber: "text-amber-700",
        green: "text-emerald-700",
        red: "text-red-700",
    }

    return (
        <div
            className={`flex items-start gap-2 text-xs leading-relaxed ${noMargin ? "" : "mt-3"} ${tones[tone]}`}
        >
            <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-80" />
            <div className="min-w-0">{children}</div>
        </div>
    )
}

function formatSellerReturnAddress(seller?: {
    name?: string | null
    email?: string | null
    addressLine1?: string | null
    addressLine2?: string | null
    addressCity?: string | null
    addressState?: string | null
    addressZipCode?: string | null
    addressCountry?: string | null
    addressPhone?: string | null
} | null): string | null {
    if (!seller) return null
    const lines = [
        seller.name,
        seller.addressLine1,
        seller.addressLine2,
        [seller.addressCity, seller.addressState, seller.addressZipCode]
            .filter(Boolean)
            .join(", "),
        seller.addressCountry,
        seller.addressPhone ? `Phone: ${seller.addressPhone}` : null,
        seller.email ? `Email: ${seller.email}` : null,
    ].filter(Boolean)
    return lines.length >= 2 ? lines.join("\n") : null
}

function DisputeStatusNote({
    dispute,
    deliveryConfirmation,
    currency,
}: {
    dispute?: {
        id: string
        status: string
        reason?: string | null
        description?: string | null
        returnRequired?: boolean | null
        returnWaiveReason?: string | null
        refund?: { status?: string; amount?: number | string } | null
        targetUser?: {
            name?: string | null
            email?: string | null
            addressLine1?: string | null
            addressLine2?: string | null
            addressCity?: string | null
            addressState?: string | null
            addressZipCode?: string | null
            addressCountry?: string | null
            addressPhone?: string | null
        } | null
    } | null
    deliveryConfirmation?: {
        hasDispute?: boolean
        disputeReason?: string | null
        disputeNote?: string | null
    } | null
    currency?: string | null
}) {
    const reasonLabel = formatDisputeReason(
        dispute?.reason || deliveryConfirmation?.disputeReason,
    )
    const note = (
        dispute?.description ||
        deliveryConfirmation?.disputeNote ||
        ""
    ).trim()

    if (dispute?.status === "WAITING_FOR_RETURN") {
        const address = formatSellerReturnAddress(dispute.targetUser)
        return (
            <StatusNote tone="amber" icon={AlertCircle}>
                <p className="font-semibold">
                    Buyer Wins — please return the artwork
                </p>
                {reasonLabel && (
                    <p className="mt-0.5">Original reason: {reasonLabel}</p>
                )}
                <p className="mt-1 text-amber-800/90">
                    Ship the artwork back to the seller. Your refund is issued
                    only after the seller confirms receipt and an admin
                    completes the refund.
                </p>
                {address ? (
                    <pre className="mt-2 whitespace-pre-wrap rounded-md border border-amber-200/80 bg-white/70 px-2.5 py-2 font-sans text-[11px] leading-relaxed text-amber-950">
                        {address}
                    </pre>
                ) : (
                    <p className="mt-1 text-amber-700/80">
                        Contact the seller (
                        {dispute.targetUser?.email || "via support"}) for the
                        return shipping address if you do not already have it.
                    </p>
                )}
            </StatusNote>
        )
    }

    if (dispute?.status === "READY_FOR_REFUND") {
        return (
            <StatusNote tone="amber" icon={Clock}>
                <p className="font-semibold">Refund ready — waiting on admin</p>
                <p className="mt-1 text-amber-800/90">
                    {dispute.returnRequired === false || dispute.returnWaiveReason
                        ? "Return was waived. "
                        : "Seller confirmed receipt. "}
                    An admin will complete your refund next. No further action is
                    needed from you.
                </p>
                {dispute.refund?.status && (
                    <p className="mt-0.5 text-amber-700/80">
                        Refund status: {dispute.refund.status}
                    </p>
                )}
            </StatusNote>
        )
    }

    if (
        dispute?.status === "RESOLVED" &&
        dispute?.refund?.status === "COMPLETED"
    ) {
        return (
            <StatusNote tone="green" icon={CheckCircle2}>
                <p className="font-semibold">
                    Dispute resolved — refund completed
                </p>
                {dispute.refund.amount != null && (
                    <p className="mt-0.5">
                        Amount: {formatMoney(dispute.refund.amount, currency)}
                    </p>
                )}
            </StatusNote>
        )
    }

    if (dispute || deliveryConfirmation?.hasDispute) {
        return (
            <StatusNote tone="amber" icon={AlertCircle}>
                <p className="font-semibold">Dispute under review</p>
                {reasonLabel && (
                    <p className="mt-0.5">Reason: {reasonLabel}</p>
                )}
                {note && (
                    <p className="mt-0.5 line-clamp-2 text-amber-700/90">
                        “{note}”
                    </p>
                )}
                <p className="mt-1 text-amber-700/80">
                    Payout stays reserved until resolved. If buyer wins and a
                    return is required, refund completes after the seller
                    confirms receipt and admin authorizes it.
                </p>
            </StatusNote>
        )
    }

    return null
}

function ShipmentTracker({ shipment }: { shipment: OrderShipment }) {
    const [isOpen, setIsOpen] = useState(false)

    const steps = [
        { status: "LABEL_CREATED", label: "Label Created", icon: Clock },
        { status: "IN_TRANSIT", label: "In Transit", icon: Truck },
        { status: "DELIVERED", label: "Delivered", icon: CheckCircle2 },
    ]

    const getStatusIndex = (status: string) => {
        if (status === "DELIVERED") return 2
        if (
            status === "OUT_FOR_DELIVERY" ||
            status === "IN_TRANSIT" ||
            status === "PICKED_UP"
        )
            return 1
        return 0
    }

    const currentIndex = getStatusIndex(shipment.status)
    const isCancelled = shipment.status === "CANCELLED"
    const isException = shipment.status === "EXCEPTION"
    const isPendingAddress = shipment.status === "PENDING_ADDRESS"
    const canTrackOnFedEx = isValidFedExTrackingNumber(
        shipment.trackingNumber || "",
    )
    const trackingEvents = getCustomerTrackingEvents(shipment.events)
    const statusLabel =
        shipment.status === "LABEL_CREATED"
            ? "Label created"
            : shipment.status === "OUT_FOR_DELIVERY"
              ? "Out for delivery"
              : shipment.status === "IN_TRANSIT"
                ? "In transit"
                : shipment.status === "PICKED_UP"
                  ? "Picked up"
                  : shipment.status === "DELIVERED"
                    ? "Delivered"
                    : shipment.status.replace(/_/g, " ").toLowerCase()

    if (isPendingAddress) {
        return (
            <StatusNote tone="amber" icon={Clock}>
                Artist is finishing shipping details before a label can be
                created.
            </StatusNote>
        )
    }

    if (isException) {
        return (
            <StatusNote tone="amber" icon={AlertCircle}>
                Label issue — tracking appears once the artist resolves it.
            </StatusNote>
        )
    }

    return (
        <div>
            <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-1.5 text-xs text-zinc-500">
                    <Package className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                    <span className="font-medium text-zinc-600">FedEx</span>
                    {canTrackOnFedEx ? (
                        <a
                            href={`https://www.fedex.com/fedextrack/?trknbr=${shipment.trackingNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 truncate font-mono text-red-700 hover:underline"
                        >
                            {shipment.trackingNumber}
                            <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                    ) : (
                        <span className="truncate font-mono text-zinc-400">
                            {shipment.trackingNumber || "Pending"}
                        </span>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="inline-flex shrink-0 items-center gap-0.5 text-[11px] text-zinc-400 transition-colors hover:text-zinc-700"
                    aria-expanded={isOpen}
                >
                    {isOpen ? "Hide" : "History"}
                    {isOpen ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                    )}
                </button>
            </div>

            <p
                className={`mt-1.5 text-sm font-semibold ${
                    shipment.status === "DELIVERED"
                        ? "text-emerald-700"
                        : isCancelled
                          ? "text-red-600"
                          : "text-zinc-800"
                }`}
            >
                {statusLabel}
            </p>

            {!isCancelled && !isException && (
                <div className="mt-4 px-1">
                    <div className="relative flex w-full items-center justify-between">
                        <div className="absolute left-0 right-0 top-[16px] z-0 h-[3px] -translate-y-1/2 rounded-full bg-gray-200">
                            <div
                                className="h-full rounded-full bg-green-500 transition-all duration-500"
                                style={{
                                    width: `${(currentIndex / (steps.length - 1)) * 100}%`,
                                }}
                            />
                        </div>

                        {steps.map((step, idx) => {
                            const Icon = step.icon
                            const isCompleted = idx <= currentIndex
                            const isCurrent = idx === currentIndex

                            return (
                                <div
                                    key={step.status}
                                    className="relative z-10 flex flex-col items-center"
                                >
                                    <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                                            isCompleted
                                                ? "bg-green-500 text-white"
                                                : "border-2 border-gray-300 bg-white text-gray-400"
                                        } ${isCurrent ? "ring-4 ring-green-100" : ""}`}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <span
                                        className={`mt-1 text-[10px] font-semibold ${
                                            isCompleted
                                                ? "text-gray-900"
                                                : "text-gray-400"
                                        }`}
                                    >
                                        {step.label}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {isCancelled && (
                <StatusNote tone="red" icon={AlertCircle}>
                    This shipment was cancelled.
                </StatusNote>
            )}

            {isOpen && (
                <div className="mt-3 space-y-2 border-l border-zinc-200 pl-3 text-left">
                    {trackingEvents.length === 0 ? (
                        <p className="text-xs text-zinc-400">
                            No tracking updates yet.
                        </p>
                    ) : (
                        trackingEvents.map((event) => (
                            <div
                                key={event.id}
                                className="flex items-baseline justify-between gap-3"
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-xs font-medium text-zinc-800">
                                        {getFriendlyTrackingLabel(event)}
                                    </p>
                                    {event.location && (
                                        <p className="truncate text-[11px] text-zinc-400">
                                            {event.location}
                                        </p>
                                    )}
                                </div>
                                <span className="shrink-0 text-[11px] text-zinc-400">
                                    {new Date(event.timestamp).toLocaleString(
                                        "en-US",
                                        {
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        },
                                    )}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

function LiveShipmentSection({
    orderId,
    fallbackShipments,
    artworkUserId,
    artworkUserIdAlt,
    orderStatus,
    deliveryConfirmation,
    dispute,
    currency,
    isLocalLogistics = false,
}: {
    orderId: string
    fallbackShipments?: OrderShipment[]
    artworkUserId?: string
    artworkUserIdAlt?: string
    orderStatus: string
    deliveryConfirmation?: {
        id: string
        hasDispute: boolean
        disputeReason?: string | null
        disputeNote?: string | null
        confirmedAt: string
    } | null
    dispute?: any
    currency?: string | null
    /** True when order used LOCAL_DELIVERY (or non-FedEx) — buyer can confirm without carrier tracking */
    isLocalLogistics?: boolean
}) {
    const { data: liveShipments, isRefetching } = useOrderShipment(orderId)

    const shipments =
        liveShipments && liveShipments.length > 0
            ? liveShipments
            : (fallbackShipments ?? [])

    const shipment = shipments.find(
        (s) =>
            s.artistId === artworkUserId || s.artistId === artworkUserIdAlt,
    )

    const alreadyHandled = !!deliveryConfirmation
    const hasDispute =
        orderStatus === "DISPUTED" ||
        !!dispute ||
        (!!deliveryConfirmation?.hasDispute && orderStatus === "PAID")

    if (shipment) {
        const isDelivered = shipment.status === "DELIVERED"
        const canConfirm =
            isDelivered && orderStatus === "PAID" && !alreadyHandled

        return (
            <div className="relative rounded-lg border border-zinc-100 bg-zinc-50/60 p-3.5">
                {isRefetching && (
                    <RefreshCw className="absolute right-3.5 top-3.5 h-3 w-3 animate-spin text-zinc-300" />
                )}
                <ShipmentTracker shipment={shipment} />

                {canConfirm && (
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                        <Button
                            size="sm"
                            className="h-8 rounded-md bg-zinc-900 px-3 text-xs font-medium text-white hover:bg-zinc-800"
                            asChild
                        >
                            <Link to={`/delivery-confirm/${orderId}`}>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Mark as received
                            </Link>
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-xs font-medium text-zinc-500 hover:bg-transparent hover:text-zinc-800"
                            asChild
                        >
                            <Link
                                to={`/delivery-confirm/${orderId}?tab=dispute`}
                            >
                                <AlertCircle className="h-3.5 w-3.5" />
                                Raise a dispute
                            </Link>
                        </Button>
                    </div>
                )}

                {hasDispute && (
                    <DisputeStatusNote
                        dispute={dispute}
                        deliveryConfirmation={deliveryConfirmation}
                        currency={currency}
                    />
                )}

                {orderStatus === "REFUNDED" && !dispute && (
                    <StatusNote tone="green" icon={CheckCircle2}>
                        This order was refunded.
                    </StatusNote>
                )}

                {alreadyHandled &&
                    !hasDispute &&
                    orderStatus === "COMPLETED" && (
                        <StatusNote tone="green" icon={CheckCircle2}>
                            Receipt confirmed.
                        </StatusNote>
                    )}
            </div>
        )
    }

    if (orderStatus === "DISPUTED" || dispute) {
        return (
            <div className="rounded-lg border border-zinc-100 bg-zinc-50/60 p-3.5">
                <DisputeStatusNote
                    dispute={dispute}
                    deliveryConfirmation={deliveryConfirmation}
                    currency={currency}
                />
            </div>
        )
    }

    // Local delivery / non-FedEx: buyer can confirm receipt while PAID (no carrier tracker)
    if (orderStatus === "PAID" && isLocalLogistics && !alreadyHandled) {
        return (
            <div className="rounded-lg border border-zinc-100 bg-zinc-50/60 p-3.5">
                <StatusNote tone="muted" icon={Clock}>
                    Local delivery — confirm once you have received the artwork
                    from the artist.
                </StatusNote>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                    <Button
                        size="sm"
                        className="h-8 rounded-md bg-zinc-900 px-3 text-xs font-medium text-white hover:bg-zinc-800"
                        asChild
                    >
                        <Link to={`/delivery-confirm/${orderId}`}>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Mark as received
                        </Link>
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-xs font-medium text-zinc-500 hover:bg-transparent hover:text-zinc-800"
                        asChild
                    >
                        <Link to={`/delivery-confirm/${orderId}?tab=dispute`}>
                            <AlertCircle className="h-3.5 w-3.5" />
                            Raise a dispute
                        </Link>
                    </Button>
                </div>
            </div>
        )
    }

    if (orderStatus === "PAID" && alreadyHandled && !hasDispute) {
        return (
            <div className="rounded-lg border border-zinc-100 bg-zinc-50/60 p-3.5">
                <StatusNote tone="green" icon={CheckCircle2} noMargin>
                    Receipt confirmed.
                </StatusNote>
            </div>
        )
    }

    if (orderStatus === "PAID") {
        return (
            <div className="rounded-lg border border-zinc-100 bg-zinc-50/60 p-3.5">
                <StatusNote tone="muted" icon={Clock} noMargin>
                    Artist is preparing your artwork for shipment.
                </StatusNote>
            </div>
        )
    }

    if (orderStatus === "COMPLETED" && alreadyHandled && !hasDispute) {
        return (
            <div className="rounded-lg border border-zinc-100 bg-zinc-50/60 p-3.5">
                <StatusNote tone="green" icon={CheckCircle2} noMargin>
                    Receipt confirmed.
                </StatusNote>
            </div>
        )
    }

    return null
}

export default function OrdersPage() {
    const { data: orders = [], isLoading, error } = useUserOrders()

    if (isLoading) {
        return (
            <ProtectedRoute>
                <OrdersSkeleton />
            </ProtectedRoute>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <EmptyState
                    icon={ShoppingBag}
                    title="Error Loading Orders"
                    description="Failed to load your orders. Please try again later."
                />
            </div>
        )
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-zinc-50/50 font-poppins">
                <div className="container mx-auto max-w-3xl px-4 py-8">
                    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h1 className="font-lexend text-xl font-semibold tracking-tight text-zinc-900">
                                Orders
                            </h1>
                            <p className="mt-0.5 text-sm text-zinc-500">
                                {orders.length}{" "}
                                {orders.length === 1 ? "order" : "orders"}
                            </p>
                        </div>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-xs font-medium text-zinc-600 hover:bg-transparent hover:text-red-700"
                            asChild
                        >
                            <Link to="/buyart">
                                Continue shopping
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </Button>
                    </div>

                    {orders.length === 0 ? (
                        <div className="rounded-xl border border-zinc-200 bg-white py-16">
                            <EmptyState
                                icon={ShoppingBag}
                                title="No Orders Yet"
                                description="You haven't placed any orders yet. Start shopping to see your orders here."
                                actionLabel="Browse Artworks"
                                onAction={() =>
                                    (window.location.href = "/buyart")
                                }
                            />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {orders.map((order) => {
                                const isDisputed =
                                    order.status === "DISPUTED" ||
                                    (!!order.deliveryConfirmation?.hasDispute &&
                                        order.status === "PAID")
                                const statusKey = isDisputed
                                    ? "DISPUTED"
                                    : order.status
                                const status =
                                    STATUS_STYLES[statusKey] ||
                                    STATUS_STYLES.PENDING

                                const orderDate = new Date(
                                    order.createdAt,
                                ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })

                                const totalAmount =
                                    typeof order.totalAmount === "string"
                                        ? Number.parseFloat(order.totalAmount)
                                        : order.totalAmount
                                const currency =
                                    order.transaction?.metadata?.currency ?? null
                                const shippingOption =
                                    order.transaction?.metadata?.shippingOption
                                const shippingType = String(
                                    shippingOption?.serviceType || "",
                                )
                                    .trim()
                                    .toUpperCase()
                                const isLocalLogistics =
                                    shippingType === "LOCAL_DELIVERY" ||
                                    (!!shippingOption &&
                                        !isFedExServiceType(shippingOption))

                                return (
                                    <article
                                        key={order.id}
                                        className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5"
                                    >
                                        <header className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 font-semibold ${status.className}`}
                                                >
                                                    <span
                                                        className={`h-1.5 w-1.5 rounded-full ${status.dotClassName}`}
                                                    />
                                                    {status.label}
                                                </span>
                                                <span className="text-zinc-300">
                                                    ·
                                                </span>
                                                <span className="text-zinc-500">
                                                    {orderDate}
                                                </span>
                                                <span className="font-mono text-[11px] text-zinc-400">
                                                    #
                                                    {order.id
                                                        .slice(0, 8)
                                                        .toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="font-lexend text-base font-semibold text-zinc-900">
                                                {formatMoney(totalAmount, currency)}
                                            </p>
                                        </header>

                                        <div className="space-y-4">
                                            {order.items.map((item) => {
                                                const artwork = item.artwork
                                                if (!artwork) return null

                                                const itemPrice =
                                                    typeof item.price ===
                                                    "string"
                                                        ? Number.parseFloat(
                                                              item.price,
                                                          )
                                                        : item.price
                                                const itemTotal =
                                                    itemPrice * item.quantity

                                                return (
                                                    <div
                                                        key={item.id}
                                                        className="space-y-3 border-t border-zinc-100 pt-4 first:border-0 first:pt-0"
                                                    >
                                                        <div className="flex gap-3">
                                                            <Link
                                                                to={`/artwork/${artwork.id}`}
                                                                className="shrink-0"
                                                            >
                                                                <div className="relative h-14 w-14 overflow-hidden rounded-md bg-zinc-100">
                                                                    <img
                                                                        src={
                                                                            artwork
                                                                                .photos?.[0] ||
                                                                            "/placeholder.svg"
                                                                        }
                                                                        alt={
                                                                            artwork.title ||
                                                                            artwork.artist ||
                                                                            "Artwork"
                                                                        }
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                </div>
                                                            </Link>

                                                            <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                                                                <Link
                                                                    to={`/artwork/${artwork.id}`}
                                                                    className="min-w-0 group"
                                                                >
                                                                    <h3 className="truncate font-lexend text-sm font-semibold text-zinc-900 transition-colors group-hover:text-red-700">
                                                                        {artwork.title ||
                                                                            "Untitled"}
                                                                    </h3>
                                                                    <p className="truncate text-xs text-zinc-500">
                                                                        {artwork.artist ||
                                                                            artwork
                                                                                .user
                                                                                ?.name ||
                                                                            "Unknown Artist"}
                                                                    </p>
                                                                    <p className="mt-0.5 text-[11px] text-zinc-400">
                                                                        Qty{" "}
                                                                        {
                                                                            item.quantity
                                                                        }
                                                                    </p>
                                                                </Link>
                                                                <span className="shrink-0 text-xs font-medium text-zinc-500">
                                                                    {formatMoney(
                                                                        itemTotal,
                                                                        currency,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <LiveShipmentSection
                                                            orderId={order.id}
                                                            fallbackShipments={
                                                                order.shipments
                                                            }
                                                            artworkUserId={
                                                                artwork.userId
                                                            }
                                                            artworkUserIdAlt={
                                                                artwork.user
                                                                    ?.id
                                                            }
                                                            orderStatus={
                                                                order.status
                                                            }
                                                            deliveryConfirmation={
                                                                order.deliveryConfirmation
                                                            }
                                                            dispute={
                                                                order.dispute
                                                            }
                                                            currency={currency}
                                                            isLocalLogistics={
                                                                isLocalLogistics
                                                            }
                                                        />
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </article>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    )
}
