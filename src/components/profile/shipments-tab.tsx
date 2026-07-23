import { useArtistShipments, useRetryShipment, useSyncShipmentTracking, ArtistShipment } from "@/services/fedex/useArtistShipments"
import { Package, ExternalLink, CheckCircle, Truck, Clock, AlertTriangle, X, MapPin, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { isValidFedExTrackingNumber, isValidShipmentLabelUrl } from "@/lib/utils/fedex"
import {
    getCustomerTrackingEvents,
    getFriendlyTrackingLabel,
} from "@/lib/shipment-tracking"
import { toast } from "sonner"
import { useSellerReturnQueue } from "@/services/disputes/useConfirmReturn"

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
    PENDING_ADDRESS: { label: "Pending Address", icon: MapPin, color: "bg-amber-100 text-amber-800" },
    LABEL_CREATED: { label: "Label Created", icon: Package, color: "bg-blue-100 text-blue-800" },
    PICKED_UP: { label: "Picked Up", icon: Truck, color: "bg-yellow-100 text-yellow-800" },
    IN_TRANSIT: { label: "In Transit", icon: Truck, color: "bg-purple-100 text-purple-800" },
    OUT_FOR_DELIVERY: { label: "Out for Delivery", icon: Truck, color: "bg-orange-100 text-orange-800" },
    DELIVERED: { label: "Delivered", icon: CheckCircle, color: "bg-green-100 text-green-800" },
    EXCEPTION: { label: "Needs Attention", icon: AlertTriangle, color: "bg-red-100 text-red-800" },
    CANCELLED: { label: "Cancelled", icon: X, color: "bg-gray-100 text-gray-800" },
}

/** Pull latest status from FedEx Track (Basic Integrated Visibility). */
function RefreshTrackingButton({ shipmentId }: { shipmentId: string }) {
    const { mutateAsync, isPending } = useSyncShipmentTracking()

    const run = async () => {
        try {
            const result = await mutateAsync({ shipmentId })
            const status = result?.shipment?.status || "updated"
            toast.success(`Tracking refreshed → ${getFriendlyStatusLabel(status)}`)
        } catch (error: any) {
            const raw =
                error?.response?.data?.message ||
                error?.response?.data?.data ||
                error?.message ||
                "Track sync failed"
            toast.error(Array.isArray(raw) ? raw.join(" ") : String(raw))
        }
    }

    return (
        <Button
            size="sm"
            variant="secondary"
            className="text-xs"
            disabled={isPending}
            onClick={run}
        >
            <RefreshCw className={`mr-1.5 h-3 w-3 ${isPending ? "animate-spin" : ""}`} />
            {isPending ? "Refreshing…" : "Refresh tracking"}
        </Button>
    )
}

function getFriendlyStatusLabel(status: string): string {
    return STATUS_CONFIG[status]?.label || status.replace(/_/g, " ")
}

function RetryLabelButton({ shipmentId }: { shipmentId: string }) {
    const { mutateAsync, isPending } = useRetryShipment()

    const handleRetry = async () => {
        try {
            await mutateAsync(shipmentId)
            toast.success("Shipping label created")
        } catch (error: any) {
            const raw =
                error?.response?.data?.message ||
                error?.response?.data?.data ||
                error?.message ||
                "Failed to generate label"
            const message = Array.isArray(raw) ? raw.join(" ") : String(raw)
            toast.error(message)
        }
    }

    return (
        <Button
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
            onClick={handleRetry}
            disabled={isPending}
        >
            <RefreshCw className={`mr-1.5 h-3 w-3 ${isPending ? "animate-spin" : ""}`} />
            {isPending ? "Generating…" : "Generate Label"}
        </Button>
    )
}

function PendingAddressCard({ shipment }: { shipment: ArtistShipment }) {
    return (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
                    <MapPin className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-amber-900 text-sm">
                        Shipping Address Required — Order #{shipment.orderId.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="mt-1 text-amber-700 text-xs">
                        {shipment.failureReason
                            ? shipment.failureReason
                            : "A buyer purchased your artwork! Add a complete shipping address in Settings, then generate the FedEx label."}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs" asChild>
                            <Link to="/profile?tab=settings">
                                <MapPin className="mr-1.5 h-3 w-3" />
                                Fix Shipping Address
                            </Link>
                        </Button>
                        <RetryLabelButton shipmentId={shipment.id} />
                    </div>
                </div>
            </div>
        </div>
    )
}

function ExceptionCard({ shipment }: { shipment: ArtistShipment }) {
    return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-red-900 text-sm">
                        Label Failed — Order #{shipment.orderId.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="mt-1 text-red-700 text-xs">
                        {shipment.failureReason || "FedEx could not create a shipping label for this order."}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {shipment.failureReason?.toLowerCase().includes("buyer") ||
                        shipment.failureReason?.toLowerCase().includes("checkout") ? (
                            <p className="w-full text-red-600 text-[11px]">
                                This is the buyer&apos;s checkout address on the order — not your seller shipping address in Settings.
                            </p>
                        ) : (
                            <Button size="sm" variant="outline" className="text-xs" asChild>
                                <Link to="/profile?tab=settings">
                                    <MapPin className="mr-1.5 h-3 w-3" />
                                    Review Address
                                </Link>
                            </Button>
                        )}
                        <RetryLabelButton shipmentId={shipment.id} />
                    </div>
                </div>
            </div>
        </div>
    )
}

function ShipmentCard({ shipment }: { shipment: ArtistShipment }) {
    if (shipment.status === "PENDING_ADDRESS") {
        return <PendingAddressCard shipment={shipment} />
    }
    if (shipment.status === "EXCEPTION") {
        return <ExceptionCard shipment={shipment} />
    }

    const statusConfig = STATUS_CONFIG[shipment.status] || STATUS_CONFIG.LABEL_CREATED
    const StatusIcon = statusConfig.icon
    const canTrackOnFedEx = isValidFedExTrackingNumber(shipment.trackingNumber || "")
    const hasValidLabel = isValidShipmentLabelUrl(shipment.labelUrl || "")
    const trackingUpdates = getCustomerTrackingEvents(shipment.events)
        .slice(0, 3)

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                        <Package className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900 text-sm">
                            Order #{shipment.orderId.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-gray-500 text-xs">
                            {new Date(shipment.createdAt).toLocaleDateString("en-US", {
                                year: "numeric", month: "short", day: "numeric"
                            })}
                        </p>
                    </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig.color}`}>
                    <StatusIcon className="h-3 w-3" />
                    {statusConfig.label}
                </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 text-sm sm:grid-cols-3">
                <div>
                    <p className="text-gray-500 text-xs">Tracking #</p>
                    <p className="mt-0.5 font-medium text-gray-900 text-xs truncate">
                        {shipment.trackingNumber || "—"}
                    </p>
                </div>
                <div>
                    <p className="text-gray-500 text-xs">Service</p>
                    <p className="mt-0.5 font-medium text-gray-900 text-xs">
                        {(shipment.serviceType || "UNKNOWN").replace(/_/g, " ")}
                    </p>
                </div>
                <div>
                    <p className="text-gray-500 text-xs">Buyer</p>
                    <p className="mt-0.5 font-medium text-gray-900 text-xs truncate">{shipment.order.buyerEmail}</p>
                </div>
            </div>

            {trackingUpdates.length > 0 && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                    <p className="mb-2 font-medium text-gray-700 text-xs uppercase tracking-wide">Latest Updates</p>
                    <div className="space-y-2">
                        {trackingUpdates.map((event) => (
                            <div key={event.id} className="flex items-start gap-2 text-xs">
                                <div className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                                <div>
                                    <span className="text-gray-700">{getFriendlyTrackingLabel(event)}</span>
                                    {event.location && <span className="ml-1 text-gray-400">— {event.location}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                {canTrackOnFedEx && (
                    <Button size="sm" variant="outline" className="text-xs" asChild>
                        <a
                            href={`https://www.fedex.com/fedextrack/?trknbr=${shipment.trackingNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <ExternalLink className="mr-1.5 h-3 w-3" />
                            Track on FedEx
                        </a>
                    </Button>
                )}
                {hasValidLabel && shipment.labelUrl && (
                    <Button size="sm" variant="outline" className="text-xs" asChild>
                        <a href={shipment.labelUrl} target="_blank" rel="noopener noreferrer">
                            <Package className="mr-1.5 h-3 w-3" />
                            View Label
                        </a>
                    </Button>
                )}
                {shipment.trackingNumber &&
                    !["CANCELLED", "PENDING_ADDRESS"].includes(
                        shipment.status,
                    ) && <RefreshTrackingButton shipmentId={shipment.id} />}
            </div>
        </div>
    )
}

export function ShipmentsTab() {
    const { data: shipments, isLoading, error } = useArtistShipments()
    const { data: returnQueue } = useSellerReturnQueue()
    const returnDisputes = returnQueue?.disputes || []

    const returnBanner =
        returnDisputes.length > 0 ? (
            <div className="space-y-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
                <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-700" />
                    <div>
                        <p className="font-semibold text-orange-900">
                            Confirm returned artwork
                        </p>
                        <p className="mt-0.5 text-orange-800/90 text-sm">
                            A buyer-wins dispute is waiting for you to confirm you
                            received the artwork back. Receipt only — not condition.
                        </p>
                    </div>
                </div>
                <ul className="space-y-2">
                    {returnDisputes.map((d: any) => (
                        <li
                            key={d.id}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-orange-100 bg-white px-3 py-2 text-sm"
                        >
                            <span>
                                {d.artwork?.title || "Artwork"} · Order #
                                {d.orderId?.slice(0, 8)?.toUpperCase()}
                            </span>
                            <Button asChild size="sm" className="h-8 text-xs">
                                <Link to={`/confirm-return/${d.id}`}>
                                    Confirm receipt
                                </Link>
                            </Button>
                        </li>
                    ))}
                </ul>
            </div>
        ) : null

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-40 animate-pulse rounded-lg bg-gray-100" />
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
                <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-red-400" />
                <p className="font-medium text-red-700">Failed to load shipments</p>
                <p className="mt-1 text-red-500 text-sm">Please try again later.</p>
            </div>
        )
    }

    if (!shipments || shipments.length === 0) {
        return (
            <div className="space-y-6">
                {returnBanner}
                <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
                    <Package className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                    <h3 className="font-semibold text-gray-700 text-lg">No Shipments Yet</h3>
                    <p className="mt-2 text-gray-500 text-sm">
                        When a buyer purchases your artwork and an order is confirmed,<br />
                        a FedEx shipment will be created for you here.
                    </p>
                    <p className="mt-4 text-gray-400 text-xs">
                        Keep a complete shipping address in Settings so labels can be generated automatically.
                    </p>
                </div>
            </div>
        )
    }

    const pending = shipments.filter(s => !["DELIVERED", "CANCELLED"].includes(s.status))
    const completed = shipments.filter(s => ["DELIVERED", "CANCELLED"].includes(s.status))
    const needsAddress = shipments.filter(s => s.status === "PENDING_ADDRESS")
    const needsAttention = shipments.filter(s => s.status === "EXCEPTION")

    return (
        <div className="space-y-8">
            {returnBanner}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-bold text-gray-900 text-xl">My Shipments</h2>
                    <p className="mt-1 text-gray-500 text-sm">Track and manage your FedEx shipments</p>
                </div>
                <div className="flex gap-2">
                    {returnDisputes.length > 0 && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-orange-800 text-xs font-medium">
                            <AlertTriangle className="h-3 w-3" />
                            {returnDisputes.length} Return confirm
                        </span>
                    )}
                    {needsAddress.length > 0 && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-amber-700 text-xs font-medium">
                            <MapPin className="h-3 w-3" />
                            {needsAddress.length} Need Address
                        </span>
                    )}
                    {needsAttention.length > 0 && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-red-700 text-xs font-medium">
                            <AlertTriangle className="h-3 w-3" />
                            {needsAttention.length} Failed
                        </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-blue-700 text-xs font-medium">
                        <Clock className="h-3 w-3" />
                        {pending.length} Active
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-green-700 text-xs font-medium">
                        <CheckCircle className="h-3 w-3" />
                        {completed.length} Completed
                    </span>
                </div>
            </div>

            {pending.length > 0 && (
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Active Shipments</h3>
                    {pending.map(s => <ShipmentCard key={s.id} shipment={s} />)}
                </div>
            )}

            {completed.length > 0 && (
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Completed Shipments</h3>
                    {completed.map(s => <ShipmentCard key={s.id} shipment={s} />)}
                </div>
            )}
        </div>
    )
}
