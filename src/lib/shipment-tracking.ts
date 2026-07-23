/** Buyer/seller-facing shipment tracking helpers */

export type TrackingEventLike = {
  id: string
  status: string
  description?: string | null
  location?: string | null
  timestamp: string
}

const CUSTOMER_TRACKING_STATUSES = new Set([
  "LABEL_CREATED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
])

const FRIENDLY_STATUS_LABELS: Record<string, string> = {
  LABEL_CREATED: "Shipping label created",
  PICKED_UP: "Picked up by carrier",
  IN_TRANSIT: "In transit",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
}

function isInternalFailureDescription(description?: string | null): boolean {
  const text = description?.trim() ?? ""
  if (!text) return false
  return (
    /^Retry failed/i.test(text) ||
    /^FedEx label creation failed/i.test(text) ||
    /INVALID\.INPUT|ADDRESSSTATEORPROVINCECODE|INCONSISTANTWEIGHTDIMENSION|MISMATCH/i.test(
      text,
    )
  )
}

/** Keep only real tracking milestones — hide retry/API noise. */
export function getCustomerTrackingEvents<T extends TrackingEventLike>(
  events: T[] | null | undefined,
): T[] {
  return (events || []).filter(
    (event) =>
      CUSTOMER_TRACKING_STATUSES.has(event.status) &&
      !isInternalFailureDescription(event.description),
  )
}

/** Short, buyer-friendly title for a tracking event. */
export function getFriendlyTrackingLabel(event: TrackingEventLike): string {
  const fromStatus = FRIENDLY_STATUS_LABELS[event.status]
  if (fromStatus) return fromStatus

  const description = event.description?.trim()
  if (description && !isInternalFailureDescription(description)) {
    // Cap overly long carrier scan text for the UI.
    return description.length > 90 ? `${description.slice(0, 87)}…` : description
  }

  return event.status.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())
}
