import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { MAX_PHOTOS } from "@/lib/constants/srtsell.constant"
import { type ArtworkFormData, artworkFormSchema } from "@/lib/schemas/artwork.schema"
import {
    useGetPresignedDocumentUploadUrl,
    useGetPresignedMultipleImageUploadUrls
} from "@/queries/uploadQueries"
import { useCreateArtwork } from "@/services/artwork/useCreateArtwork"
import { uploadFileToS3 } from "@/services/upload"
import type { CreateArtworkDto } from "@/types/artwork.types"
import { zodResolver } from "@hookform/resolvers/zod"
import { InfoIcon } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { Card } from "../ui/card"
import { ArtworkInfoSection } from "./artworkInfoSection"
import { BankingSection } from "./bankingSection"
import { DescriptionSection } from "./descriptionSection"
import { PhotosSection } from "./photosSection"
import { PriceSection } from "./priceSection"
import { ProofOfOriginSection } from "./proofOfOriginSection"

/**
 * Default form values for the artwork selling form
 * These values are used to initialize the React Hook Form
 * Note: artist and accountHolder will be prefilled from user data if available
 */
const getDefaultValues = (userName?: string): ArtworkFormData => ({
    categoryIds: [],
    artist: userName || "", // Prefill with user's name if available
    support: "",
    titleOfArtwork: "",
    state: "",
    yearOfArtwork: "",
    dimensions: { height: "", width: "", depth: "" },
    isFramed: "",
    weight: "",
    handDeliveryAccepted: "",
    origin: "",
    yearOfAcquisition: "",
    proofOfOrigin: null,
    description: "",
    photos: Array(MAX_PHOTOS).fill(null),
    desiredPrice: "",
    acceptPriceNegotiation: "",
    accountHolder: userName || "", // Prefill with user's name if available
    iban: "",
    bicCode: "",
    acceptTermsOfSale: false,
    giveSalesMandate: false
})

/**
 * Main artwork selling form component
 * Uses React Hook Form with Zod validation for form management
 * Handles submission of artwork data to the backend API
 */
export function SellArtForm() {
    const { user } = useAuth()
    const userName = user?.name || ""

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
        watch,
        reset
    } = useForm<ArtworkFormData>({
        resolver: zodResolver(artworkFormSchema),
        defaultValues: getDefaultValues(userName),
        mode: "onChange" // Validate on change for better UX
    })

    // Update artist and accountHolder fields when user data becomes available
    useEffect(() => {
        if (userName) {
            setValue("artist", userName)
            setValue("accountHolder", userName)
        }
    }, [userName, setValue])

    const formData = watch()

    const { createArtwork, isCreating } = useCreateArtwork()
    const { mutateAsync: getPresignedMultipleImageUrls } = useGetPresignedMultipleImageUploadUrls()
    const { mutateAsync: getPresignedDocumentUrl } = useGetPresignedDocumentUploadUrl()
    const navigate = useNavigate()

    /**
     * Upload files to S3 and return their public URLs
     */
    const uploadFilesToS3 = async (files: File[]): Promise<string[]> => {
        // Step 1: Get all presigned URLs in a single API request
        const fileData = files.map((file) => ({
            fileName: file.name,
            contentType: file.type
        }))

        const presignedResponse = await getPresignedMultipleImageUrls({
            files: fileData,
            expirySeconds: 3600
        })

        // Step 2: Upload all files to S3 in parallel using the presigned URLs
        const uploadPromises = files.map(async (file, index) => {
            const presignedData = presignedResponse.urls[index]
            await uploadFileToS3(presignedData.presignedUrl, file)
            return presignedData.publicUrl
        })

        return Promise.all(uploadPromises)
    }

    /**
     * Upload document to S3 and return public URL
     */
    const uploadDocumentToS3 = async (file: File): Promise<string> => {
        // Get presigned URL for document
        const presignedData = await getPresignedDocumentUrl({
            fileName: file.name,
            contentType: file.type,
            expirySeconds: 3600
        })

        // Upload file to S3
        await uploadFileToS3(presignedData.presignedUrl, file)

        // Return public URL
        return presignedData.publicUrl
    }

    /**
     * Handles form submission with React Hook Form
     * Validation is handled automatically by Zod schema
     * Uploads files to S3 first, then submits artwork with URLs
     */
    const onSubmit = async (data: ArtworkFormData) => {
        try {
            // Step 1: Upload photos to S3
            const photoFiles = data.photos.filter((photo): photo is File => photo !== null)
            if (photoFiles.length === 0) {
                throw new Error("At least one photo is required")
            }

            const photoUrls = await uploadFilesToS3(photoFiles)

            // Step 2: Upload proof of origin to S3 (if provided)
            let proofOfOriginUrl: string | undefined
            if (data.proofOfOrigin) {
                proofOfOriginUrl = await uploadDocumentToS3(data.proofOfOrigin)
            }

            // Step 3: Convert form data to CreateArtworkDto
            const artworkData: CreateArtworkDto = {
                title: data.titleOfArtwork || undefined,
                artist: data.artist,
                categoryIds: data.categoryIds,
                support: data.support,
                state: data.state,
                yearOfArtwork: data.yearOfArtwork,
                dimensions: {
                    height: data.dimensions.height,
                    width: data.dimensions.width,
                    depth: data.dimensions.depth || undefined
                },
                isFramed: data.isFramed === "yes",
                weight: data.weight,
                handDeliveryAccepted: data.handDeliveryAccepted === "yes",
                origin: data.origin,
                yearOfAcquisition: data.yearOfAcquisition || "",
                description: data.description || "",
                desiredPrice: Number.parseFloat(data.desiredPrice),
                acceptPriceNegotiation: data.acceptPriceNegotiation === "yes",
                accountHolder: data.accountHolder,
                iban: data.iban,
                bicCode: data.bicCode || undefined,
                acceptTermsOfSale: data.acceptTermsOfSale,
                giveSalesMandate: data.giveSalesMandate,
                proofOfOrigin: proofOfOriginUrl,
                photos: photoUrls
            }

            // Step 4: Submit artwork using API
            const result = await createArtwork(artworkData)
            console.log("Submission successful:", result)

            // Reset form on success
            reset()

            // Navigate to artwork detail or marketplace
            if (result.artworkId) {
                navigate(`/artwork/${result.artworkId}`)
            } else {
                navigate("/buyart")
            }
        } catch (error: any) {
            console.error("Error submitting form:", error)
            // Error is already handled by useCreateArtwork hook (toast notification)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <Alert className="border-none bg-white">
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                    Tips for filling out the artwork sales form. All required fields are marked with
                    an asterisk (*).
                </AlertDescription>
            </Alert>

            <Card className="space-y-8 p-6">
                <ArtworkInfoSection control={control} errors={errors} />

                <ProofOfOriginSection control={control} errors={errors} setValue={setValue} />

                <DescriptionSection control={control} errors={errors} />

                <PhotosSection
                    control={control}
                    errors={errors}
                    setValue={setValue}
                    formData={formData}
                />

                <PriceSection control={control} errors={errors} formData={formData} />

                <BankingSection control={control} errors={errors} formData={formData} />

                <div className="flex justify-end pt-6">
                    <Button
                        type="submit"
                        size="lg"
                        disabled={isSubmitting || isCreating}
                        className="bg-red-700 text-white hover:bg-red-800"
                    >
                        {isSubmitting || isCreating ? "Submitting..." : "Submit your artwork"}
                    </Button>
                </div>
            </Card>
        </form>
    )
}
