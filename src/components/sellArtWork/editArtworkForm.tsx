import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import {
  artworkFormSchema,
  type ArtworkFormData,
} from "@/lib/schemas/artwork.schema";
import { MAX_PHOTOS } from "@/lib/constants/srtsell.constant";
import { useUpdateArtwork } from "@/services/artwork/useUpdateArtwork";
import { useGetPresignedImageUploadUrl, useGetPresignedDocumentUploadUrl } from "@/queries/uploadQueries";
import { uploadFileToS3 } from "@/services/upload";
import { ArtworkInfoSection } from "./artworkInfoSection";
import { ProofOfOriginSection } from "./proofOfOriginSection";
import { DescriptionSection } from "./descriptionSection";
import { PhotosSection } from "./photosSection";
import { PriceSection } from "./priceSection";
import { BankingSection } from "./bankingSection";
import { Card } from "../ui/card";
import { useNavigate } from "react-router-dom";
import type { CreateArtworkDto, Artwork } from "@/types/artwork.types";
import { useEffect } from "react";
import { toast } from "sonner";

/**
 * Convert artwork data to form data format
 */
const artworkToFormData = (artwork: Artwork): ArtworkFormData => {
  const dimensions = typeof artwork.dimensions === 'object' && artwork.dimensions !== null
    ? artwork.dimensions
    : { height: 0, width: 0, depth: 0 };

  // Convert photos array to form format (fill with nulls up to MAX_PHOTOS)
  const photos = [...artwork.photos || []];
  while (photos.length < MAX_PHOTOS) {
    photos.push(null);
  }

  return {
    typeOfArtwork: "",
    technique: artwork.technique || "",
    artist: artwork.artist || "",
    support: artwork.support || "",
    titleOfArtwork: artwork.title || "",
    state: artwork.state || "",
    yearOfArtwork: artwork.yearOfArtwork || "",
    dimensions: {
      height: String(dimensions.height || ""),
      width: String(dimensions.width || ""),
      depth: dimensions.depth ? String(dimensions.depth) : "",
    },
    isFramed: artwork.isFramed ? "yes" : "no",
    weight: artwork.weight || "",
    handDeliveryAccepted: artwork.handDeliveryAccepted ? "yes" : "no",
    origin: artwork.origin || "",
    yearOfAcquisition: artwork.yearOfAcquisition || "",
    proofOfOrigin: artwork.proofOfOrigin || null,
    description: artwork.description || "",
    photos: photos.slice(0, MAX_PHOTOS),
    desiredPrice: String(artwork.desiredPrice || ""),
    acceptPriceNegotiation: artwork.acceptPriceNegotiation ? "yes" : "no",
    accountHolder: artwork.accountHolder || "",
    iban: artwork.iban || "",
    bicCode: artwork.bicCode || "",
    acceptTermsOfSale: artwork.acceptTermsOfSale || false,
    giveSalesMandate: artwork.giveSalesMandate || false,
  };
};

interface EditArtworkFormProps {
  artwork: Artwork;
}

/**
 * Edit artwork form component
 * Reuses the same form structure as SellArtForm but prefills with existing artwork data
 */
export function EditArtworkForm({ artwork }: EditArtworkFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<ArtworkFormData>({
    resolver: zodResolver(artworkFormSchema),
    defaultValues: artworkToFormData(artwork),
    mode: "onChange",
  });

  const formData = watch();
  const { updateArtwork, isUpdating } = useUpdateArtwork();
  const { mutateAsync: getPresignedImageUrl } = useGetPresignedImageUploadUrl();
  const { mutateAsync: getPresignedDocumentUrl } = useGetPresignedDocumentUploadUrl();
  const navigate = useNavigate();

  // Reset form when artwork data changes
  useEffect(() => {
    reset(artworkToFormData(artwork));
  }, [artwork, reset]);

  /**
   * Upload files to S3 and return their public URLs
   */
  const uploadFilesToS3 = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(async (file) => {
      const presignedData = await getPresignedImageUrl({
        fileName: file.name,
        contentType: file.type,
        expirySeconds: 3600,
      });

      await uploadFileToS3(presignedData.presignedUrl, file);
      return presignedData.publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  /**
   * Upload document to S3 and return public URL
   */
  const uploadDocumentToS3 = async (file: File): Promise<string> => {
    const presignedData = await getPresignedDocumentUrl({
      fileName: file.name,
      contentType: file.type,
      expirySeconds: 3600,
    });

    await uploadFileToS3(presignedData.presignedUrl, file);
    return presignedData.publicUrl;
  };

  /**
   * Handles form submission
   */
  const onSubmit = async (data: ArtworkFormData) => {
    try {
      // Step 1: Upload new photos to S3 (only new File objects)
      const newPhotoFiles = data.photos.filter(
        (photo): photo is File => photo instanceof File
      );
      const existingPhotoUrls = data.photos.filter(
        (photo): photo is string => typeof photo === "string" && photo.startsWith("http")
      );

      let photoUrls: string[] = [...existingPhotoUrls];

      if (newPhotoFiles.length > 0) {
        const newPhotoUrls = await uploadFilesToS3(newPhotoFiles);
        photoUrls = [...existingPhotoUrls, ...newPhotoUrls];
      }

      // Step 2: Upload proof of origin if it's a new file
      let proofOfOriginUrl: string | undefined = artwork.proofOfOrigin;
      if (data.proofOfOrigin instanceof File) {
        proofOfOriginUrl = await uploadDocumentToS3(data.proofOfOrigin);
      } else if (!data.proofOfOrigin) {
        proofOfOriginUrl = undefined;
      }

      // Step 3: Convert form data to UpdateArtworkDto
      const artworkData: Partial<CreateArtworkDto> = {
        title: data.titleOfArtwork || undefined,
        artist: data.artist,
        technique: data.technique,
        support: data.support,
        state: data.state,
        yearOfArtwork: data.yearOfArtwork,
        dimensions: {
          height: parseFloat(data.dimensions.height),
          width: parseFloat(data.dimensions.width),
          depth: data.dimensions.depth ? parseFloat(data.dimensions.depth) : undefined,
        },
        isFramed: data.isFramed === "yes",
        weight: data.weight,
        handDeliveryAccepted: data.handDeliveryAccepted === "yes",
        origin: data.origin,
        yearOfAcquisition: data.yearOfAcquisition || "",
        description: data.description || "",
        desiredPrice: parseFloat(data.desiredPrice),
        acceptPriceNegotiation: data.acceptPriceNegotiation === "yes",
        accountHolder: data.accountHolder,
        iban: data.iban,
        bicCode: data.bicCode || undefined,
        acceptTermsOfSale: data.acceptTermsOfSale,
        giveSalesMandate: data.giveSalesMandate,
        proofOfOrigin: proofOfOriginUrl,
        photos: photoUrls,
      };

      // Step 4: Update artwork using API
      await updateArtwork(artwork.id, artworkData);

      // Navigate back to artwork detail
      navigate(`/artwork/${artwork.id}`);
    } catch (error: any) {
      console.error("Error updating artwork:", error);
      toast.error("Failed to update artwork: " + (error?.message || "An error occurred"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Alert className="bg-white border-none">
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Update your artwork information. All required fields are marked with an asterisk (*).
        </AlertDescription>
      </Alert>

      <Card className="p-6 space-y-8">
        <ArtworkInfoSection control={control} errors={errors} />

        <ProofOfOriginSection
          control={control}
          errors={errors}
          setValue={setValue}
        />

        <DescriptionSection control={control} errors={errors} />

        <PhotosSection
          control={control}
          errors={errors}
          setValue={setValue}
          formData={formData}
        />

        <PriceSection control={control} errors={errors} formData={formData} />

        <BankingSection control={control} errors={errors} formData={formData} />

        <div className="flex justify-end gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting || isUpdating}
            className="bg-red-700 hover:bg-red-800 text-white"
          >
            {isSubmitting || isUpdating ? "Updating..." : "Update Artwork"}
          </Button>
        </div>
      </Card>
    </form>
  );
}

