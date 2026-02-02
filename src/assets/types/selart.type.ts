// Re-export types from schema for backward compatibility
export type { ArtworkFormData } from "@/lib/schemas/artwork.schema"

export interface ArtworkDimensions {
    height: string
    width: string
    depth?: string
}

export interface PhotoUploadSlot {
    id: number
    label: string
    file: File | null
}

export interface SelectOption {
    value: string
    label: string
}
