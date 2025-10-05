import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import type { ArtworkFormData } from "@/lib/schemas/artwork.schema";
import { MAX_FILE_SIZE_MB } from "@/lib/constants/srtsell.constant";
import { PhotoUploadBox } from "./photoUploadBox";
import { AddPhotoBox } from "./addPhotoBox";

interface PhotosSectionProps {
  control: Control<ArtworkFormData>;
  errors: FieldErrors<ArtworkFormData>;
  setValue: (name: keyof ArtworkFormData, value: any) => void;
  formData: ArtworkFormData;
}

/**
 * Photos Section Component
 * Handles photo uploads for the artwork
 * Uses React Hook Form Controller for form state management
 */
export function PhotosSection({
  control,
  errors,
  setValue,
  formData,
}: PhotosSectionProps) {
  const [photoSlots, setPhotoSlots] = useState(5);
  const MAX_PHOTOS = 20; // Maximum allowed photos

  const handlePhotoChange = (index: number, file: File) => {
    const newPhotos = [...formData.photos];
    newPhotos[index] = file;
    setValue("photos", newPhotos);
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = [...formData.photos];
    newPhotos[index] = null;
    setValue("photos", newPhotos);
  };

  const handleAddMorePhotos = (file: File) => {
    // Find first empty slot
    const emptyIndex = formData.photos.findIndex((photo) => photo === null);
    if (emptyIndex !== -1) {
      handlePhotoChange(emptyIndex, file);
    } else {
      // Add new slot if under max
      if (photoSlots < MAX_PHOTOS) {
        const newPhotos = [...formData.photos, file];
        setValue("photos", newPhotos);
        setPhotoSlots(photoSlots + 1);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>
          3/ Photos<span className="text-destructive">*</span>
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          Your chances of being accepted on our online gallery will increase if
          you provide us with high-quality photos and more detailed information
          about the piece.
        </p>
      </div>

      <Controller
        name="photos"
        control={control}
        render={() => (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Array.from({ length: photoSlots - 1 }).map((_, index) => (
              <PhotoUploadBox
                key={index}
                index={index}
                file={formData.photos[index] || null}
                onFileSelect={handlePhotoChange}
                onRemove={handleRemovePhoto}
              />
            ))}

            <AddPhotoBox
              onFileSelect={handleAddMorePhotos}
              disabled={photoSlots >= MAX_PHOTOS}
            />
          </div>
        )}
      />

      {errors.photos && (
        <p className="text-sm text-destructive">{errors.photos.message}</p>
      )}

      <p className="text-xs text-muted-foreground">
        Maximum file size {MAX_FILE_SIZE_MB} MB. (Accepted formats: jpg, jpeg,
        png)
      </p>
    </div>
  );
}
