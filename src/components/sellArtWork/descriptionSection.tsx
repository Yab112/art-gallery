import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FORM_TIPS } from "@/lib/constants/srtsell.constant"
import type { ArtworkFormData } from "@/lib/schemas/artwork.schema"
import { type Control, Controller, type FieldErrors } from "react-hook-form"

interface DescriptionSectionProps {
    control: Control<ArtworkFormData>
    errors: FieldErrors<ArtworkFormData>
}

/**
 * Description Section Component
 * Contains the artwork description textarea field
 * Uses React Hook Form Controller for form state management
 */
export function DescriptionSection({ control, errors }: DescriptionSectionProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor="description">2/ Description of the artwork and remarks</Label>
            <Controller
                name="description"
                control={control}
                render={({ field }) => (
                    <Textarea
                        id="description"
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder={FORM_TIPS}
                        className="min-h-32 resize-y"
                    />
                )}
            />
            {errors.description && (
                <p className="text-destructive text-sm">{errors.description.message}</p>
            )}
        </div>
    )
}
