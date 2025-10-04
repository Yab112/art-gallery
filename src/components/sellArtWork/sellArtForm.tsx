"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import type { ArtworkFormData } from "@/lib/types/selart.type";
import { MAX_PHOTOS } from "@/lib/constants/srtsell.constant";
import { submitArtwork } from "@/lib/api/artwork";
import { ArtworkInfoSection } from "./artworkInfoSection";
import { ProofOfOriginSection } from "./proofOfOriginSection";
import { DescriptionSection } from "./descriptionSection";
import { PhotosSection } from "./photosSection";
import { PriceSection } from "./priceSection";
import { BankingSection } from "./bankingSection";
import { Card } from "../ui/card";

const initialFormData: ArtworkFormData = {
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

export function SellArtForm() {
  const [formData, setFormData] = useState<ArtworkFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof ArtworkFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const convertToFormData = (data: ArtworkFormData): FormData => {
    const formData = new FormData();

    // Add all text fields
    formData.append("typeOfArtwork", data.typeOfArtwork);
    formData.append("technique", data.technique);
    formData.append("artist", data.artist);
    formData.append("support", data.support);
    formData.append("titleOfArtwork", data.titleOfArtwork);
    formData.append("state", data.state);
    formData.append("yearOfArtwork", data.yearOfArtwork);
    formData.append("isFramed", data.isFramed);
    formData.append("weight", data.weight);
    formData.append("handDeliveryAccepted", data.handDeliveryAccepted);
    formData.append("origin", data.origin);
    formData.append("yearOfAcquisition", data.yearOfAcquisition);
    formData.append("description", data.description);
    formData.append("desiredPrice", data.desiredPrice);
    formData.append("acceptPriceNegotiation", data.acceptPriceNegotiation);
    formData.append("accountHolder", data.accountHolder);
    formData.append("iban", data.iban);
    formData.append("bicCode", data.bicCode);
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

  const validateForm = (data: ArtworkFormData): string[] => {
    const errors: string[] = [];

    if (!data.typeOfArtwork) errors.push("Type of artwork is required");
    if (!data.technique) errors.push("Technique is required");
    if (!data.artist) errors.push("Artist name is required");
    if (!data.titleOfArtwork) errors.push("Title of artwork is required");
    if (!data.desiredPrice) errors.push("Desired price is required");
    if (!data.accountHolder) errors.push("Account holder is required");
    if (!data.iban) errors.push("IBAN is required");
    if (!data.acceptTermsOfSale)
      errors.push("You must accept the terms of sale");
    if (!data.giveSalesMandate) errors.push("You must give sales mandate");

    // Check if at least one photo is uploaded
    const hasPhotos = data.photos.some((photo) => photo !== null);
    if (!hasPhotos) errors.push("At least one photo is required");

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form
      const validationErrors = validateForm(formData);
      if (validationErrors.length > 0) {
        alert(
          "Please fix the following errors:\n" + validationErrors.join("\n")
        );
        setIsSubmitting(false);
        return;
      }

      // Convert to FormData
      const formDataToSend = convertToFormData(formData);

      // Log FormData contents for debugging
      console.log("FormData contents:");
      for (const [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }

      // Submit artwork using API function
      const result = await submitArtwork(formDataToSend);
      console.log("Submission successful:", result);

      // Reset form on success
      setFormData(initialFormData);
      alert(
        `Artwork submitted successfully! ${
          result.artworkId ? `ID: ${result.artworkId}` : ""
        }`
      );
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Alert className="bg-white border-none">
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Tips for filling out the artwork sales form.
        </AlertDescription>
      </Alert>

      <Card className="p-6 space-y-8">
        <ArtworkInfoSection formData={formData} onChange={handleChange} />

        <ProofOfOriginSection formData={formData} onChange={handleChange} />

        <DescriptionSection formData={formData} onChange={handleChange} />

        <PhotosSection formData={formData} onChange={handleChange} />

        <PriceSection formData={formData} onChange={handleChange} />

        <BankingSection formData={formData} onChange={handleChange} />

        <div className="flex justify-end pt-6">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit your artwork"}
          </Button>
        </div>
      </Card>
    </form>
  );
}
