import { z } from "zod"

/**
 * Zod validation schema for artwork form data
 * This schema defines the validation rules for the art selling form
 */
export const artworkFormSchema = z.object({
    // Section 1: Information about the artwork
    categoryIds: z.array(z.string()).min(1, "At least one category is required"),
    artist: z.string().min(1, "Artist name is required"),
    support: z.string().min(1, "Support is required"),
    titleOfArtwork: z.string().optional(),
    state: z.string().min(1, "State is required"),
    yearOfArtwork: z.string().min(1, "Year of artwork is required"),
    dimensions: z.object({
        height: z.string().min(1, "Height is required"),
        width: z.string().min(1, "Width is required"),
        depth: z.string().optional()
    }),
    isFramed: z.string().min(1, "Framed status is required"),
    weight: z.string().min(1, "Weight is required"),
    handDeliveryAccepted: z.string().min(1, "Hand delivery status is required"),
    origin: z.string().min(1, "Origin is required"),
    yearOfAcquisition: z.string().optional(),
    proofOfOrigin: z
        .union([z.instanceof(File), z.string()])
        .optional()
        .nullable(),

    // Section 2: Description
    description: z.string().optional(),

    // Section 3: Photos - at least one photo is required
    photos: z
        .array(z.union([z.instanceof(File), z.string()]).nullable())
        .refine(
            (photos) => photos.some((photo) => photo !== null && photo !== ""),
            "At least one photo is required"
        ),

    // Section 4: Price
    desiredPrice: z.string().min(1, "Desired price is required"),
    acceptPriceNegotiation: z.string().min(1, "Price negotiation preference is required"),

    // Section 5: Banking information
    accountHolder: z.string().min(1, "Account holder is required"),
    iban: z.string().min(1, "IBAN is required"),
    bicCode: z.string().optional(),
    acceptTermsOfSale: z
        .boolean()
        .refine((val) => val === true, "You must accept the terms of sale"),
    giveSalesMandate: z.boolean().refine((val) => val === true, "You must give sales mandate")
})

export type ArtworkFormData = z.infer<typeof artworkFormSchema>
