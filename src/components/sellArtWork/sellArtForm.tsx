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
import { submitArtwork } from "@/lib/api/artwork";
import { ArtworkInfoSection } from "./artworkInfoSection";
import { ProofOfOriginSection } from "./proofOfOriginSection";
import { DescriptionSection } from "./descriptionSection";
import { PhotosSection } from "./photosSection";
import { PriceSection } from "./priceSection";
import { BankingSection } from "./bankingSection";
import { Card } from "../ui/card";

/**
 * Default form values for the artwork selling form
 * These values are used to initialize the React Hook Form
 */
const defaultValues: ArtworkFormData = {
  typeOfArtwork: "",
  technique: "",
  artist: "",
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
  accountHolder: "",
  iban: "",
  bicCode: "",
  acceptTermsOfSale: false,
  giveSalesMandate: false,
};

/**
 * Main artwork selling form component
 * Uses React Hook Form with Zod validation for form management
 * Handles submission of artwork data to the backend API
 */
export function SellArtForm() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<ArtworkFormData>({
    resolver: zodResolver(artworkFormSchema),
    defaultValues,
    mode: "onChange", // Validate on change for better UX
  });

  const formData = watch(); 

  /**
   * Converts form data to FormData for API submission
   * Handles file uploads and form field serialization
   */
  const convertToFormData = (data: ArtworkFormData): FormData => {
    const formData = new FormData();

    // Add all text fields
    formData.append("typeOfArtwork", data.typeOfArtwork);
    formData.append("technique", data.technique);
    formData.append("artist", data.artist);
    formData.append("support", data.support);
    formData.append("titleOfArtwork", data.titleOfArtwork || "");
    formData.append("state", data.state);
    formData.append("yearOfArtwork", data.yearOfArtwork);
    formData.append("isFramed", data.isFramed);
    formData.append("weight", data.weight);
    formData.append("handDeliveryAccepted", data.handDeliveryAccepted);
    formData.append("origin", data.origin);
    formData.append("yearOfAcquisition", data.yearOfAcquisition || "");
    formData.append("description", data.description || "");
    formData.append("desiredPrice", data.desiredPrice);
    formData.append("acceptPriceNegotiation", data.acceptPriceNegotiation);
    formData.append("accountHolder", data.accountHolder);
    formData.append("iban", data.iban);
    formData.append("bicCode", data.bicCode || "");
    formData.append("acceptTermsOfSale", data.acceptTermsOfSale.toString());
    formData.append("giveSalesMandate", data.giveSalesMandate.toString());

    // Add dimensions as JSON string
    formData.append("dimensions", JSON.stringify(data.dimensions));

    // Add proof of origin file
    if (data.proofOfOrigin) {
      formData.append("proofOfOrigin", data.proofOfOrigin);
    }

    // Add photos (filter out null values)
    data.photos.forEach((photo, index) => {
      if (photo) {
        formData.append(`photo_${index}`, photo);
      }
    });

    return formData;
  };

  /**
   * Handles form submission with React Hook Form
   * Validation is handled automatically by Zod schema
   */
  const onSubmit = async (data: ArtworkFormData) => {
    try {
      // Convert to FormData for API submission
      const formDataToSend = convertToFormData(data);

      // Log FormData contents for debugging
      console.log("FormData contents:");
      for (const [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }

      // Submit artwork using API function
      const result = await submitArtwork(formDataToSend);
      console.log("Submission successful:", result);

      // Reset form on success
      reset();
      alert(
        `Artwork submitted successfully! ${
          result.artworkId ? `ID: ${result.artworkId}` : ""
        }`
      );
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Alert className="bg-white border-none">
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Tips for filling out the artwork sales form. All required fields are
          marked with an asterisk (*).
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

        <BankingSection control={control} errors={errors} />

        <div className="flex justify-end pt-6">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit your artwork"}
          </Button>
        </div>
      </Card>
    </form>
  );
}
