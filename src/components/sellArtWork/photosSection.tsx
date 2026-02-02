import { Label } from "@/components/ui/label"
import { MAX_FILE_SIZE_MB } from "@/lib/constants/srtsell.constant"
import type { ArtworkFormData } from "@/lib/schemas/artwork.schema"
import { useState } from "react"
import { type Control, Controller, type FieldErrors } from "react-hook-form"
import { AddPhotoBox } from "./addPhotoBox"
import { PhotoUploadBox } from "./photoUploadBox"

interface PhotosSectionProps {
    control: Control<ArtworkFormData>
    errors: FieldErrors<ArtworkFormData>
    setValue: (name: keyof ArtworkFormData, value: any) => void
    formData: ArtworkFormData
}

/**
 * Photos Section Component
 * Handles photo uploads for the artwork
 * Uses React Hook Form Controller for form state management
 */
export function PhotosSection({ control, errors, setValue, formData }: PhotosSectionProps) {
    const [photoSlots, setPhotoSlots] = useState(5)
    const MAX_PHOTOS = 20 // Maximum allowed photos

    const handlePhotoChange = (index: number, file: File) => {
        const newPhotos = [...formData.photos]
        newPhotos[index] = file
        setValue("photos", newPhotos)
    }

    const handleRemovePhoto = (index: number) => {
        const newPhotos = [...formData.photos]
        newPhotos[index] = null
        setValue("photos", newPhotos)
    }

    const handleAddMorePhotos = (file: File) => {
        // Find first empty slot
        const emptyIndex = formData.photos.findIndex((photo) => photo === null)
        if (emptyIndex !== -1) {
            handlePhotoChange(emptyIndex, file)
        } else {
            // Add new slot if under max
            if (photoSlots < MAX_PHOTOS) {
                const newPhotos = [...formData.photos, file]
                setValue("photos", newPhotos)
                setPhotoSlots(photoSlots + 1)
            }
        }
    }

    return (
        <div className="space-y-4">
            <div>
                <Label>
                    3/ Photos<span className="text-destructive">*</span>
                </Label>
                <p className="mt-1 text-muted-foreground text-sm">
                    Your chances of being accepted on our online gallery will increase if you
                    provide us with high-quality photos and more detailed information about the
                    piece.
                </p>
            </div>

            <Controller
                name="photos"
                control={control}
                render={() => (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                        {Array.from({ length: photoSlots - 1 }).map((_, index) => {
                            const photo = formData.photos[index]
                            // Handle both File objects and string URLs
                            const photoValue =
                                photo instanceof File || typeof photo === "string" ? photo : null

                            return (
                                <PhotoUploadBox
                                    key={index}
                                    index={index}
                                    file={photoValue}
                                    onFileSelect={handlePhotoChange}
                                    onRemove={handleRemovePhoto}
                                />
                            )
                        })}

                        <AddPhotoBox
                            onFileSelect={handleAddMorePhotos}
                            disabled={photoSlots >= MAX_PHOTOS}
                        />
                    </div>
                )}
            />

            {errors.photos && <p className="text-destructive text-sm">{errors.photos.message}</p>}

            <p className="text-muted-foreground text-xs">
                Maximum file size {MAX_FILE_SIZE_MB} MB. (Accepted formats: jpg, jpeg, png)
            </p>
        </div>
    )
}
