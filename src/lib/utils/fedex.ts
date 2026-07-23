/** FedEx tracking numbers are numeric and typically 12 or 15 digits. */
export function isValidFedExTrackingNumber(trackingNumber: string): boolean {
    return /^\d{12,15}$/.test(trackingNumber?.trim() ?? "")
}

export function isValidShipmentLabelUrl(labelUrl: string): boolean {
    const trimmed = labelUrl?.trim() ?? ""
    if (!trimmed) return false
    if (trimmed.includes("mock-s3-bucket")) return false
    return trimmed.startsWith("http")
}
