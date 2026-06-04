import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    ARTWORK_STATES,
    ORIGIN_OPTIONS,
    SUPPORT_TYPES,
    YES_NO_OPTIONS
} from "@/lib/constants/srtsell.constant"
import type { ArtworkFormData } from "@/lib/schemas/artwork.schema"
import { useGetCategories } from "@/services/category/useGetCategories"
import { Loader2 } from "lucide-react"
import { type Control, Controller, type FieldErrors } from "react-hook-form"
import { FormField } from "./formField"
import { SelectField } from "./selectField"

interface ArtworkInfoSectionProps {
    control: Control<ArtworkFormData>
    errors: FieldErrors<ArtworkFormData>
}

/**
 * Artwork Information Section Component
 * Contains all the basic information fields about the artwork being sold
 * Uses React Hook Form Controller for form state management
 */
export function ArtworkInfoSection({ control, errors }: ArtworkInfoSectionProps) {
    const { data: categories, isLoading: isLoadingCategories } = useGetCategories()

    return (
        <div className="space-y-6">
            <div>
                <h2 className="mb-4 font-semibold text-2xl">
                    1/ Information about the artwork for sale
                </h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                        label="Categories"
                        required
                        htmlFor="categoryIds"
                        description={errors.categoryIds?.message}
                    >
                        <Controller
                            name="categoryIds"
                            control={control}
                            render={({ field }) => {
                                const selectedIds = field.value || []

                                if (isLoadingCategories) {
                                    return (
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Loading categories...</span>
                                        </div>
                                    )
                                }

                                return (
                                    <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
                                        {categories && categories.length > 0 ? (
                                            categories.map((category) => (
                                                <div
                                                    key={category.id}
                                                    className="flex items-center space-x-2"
                                                >
                                                    <Checkbox
                                                        id={`category-${category.id}`}
                                                        checked={selectedIds.includes(category.id)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                field.onChange([
                                                                    ...selectedIds,
                                                                    category.id
                                                                ])
                                                            } else {
                                                                field.onChange(
                                                                    selectedIds.filter(
                                                                        (id) => id !== category.id
                                                                    )
                                                                )
                                                            }
                                                        }}
                                                    />
                                                    <Label
                                                        htmlFor={`category-${category.id}`}
                                                        className="cursor-pointer font-normal text-sm"
                                                    >
                                                        {category.name}
                                                    </Label>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-sm">
                                                No categories available
                                            </p>
                                        )}
                                    </div>
                                )
                            }}
                        />
                    </FormField>

                    <FormField
                        label="Artist"
                        required
                        htmlFor="artist"
                        description={errors.artist?.message}
                    >
                        <Controller
                            name="artist"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    id="artist"
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Artist name"
                                />
                            )}
                        />
                    </FormField>

                    <FormField
                        label="Support"
                        required
                        htmlFor="support"
                        description={errors.support?.message}
                    >
                        <Controller
                            name="support"
                            control={control}
                            render={({ field }) => (
                                <SelectField
                                    id="support"
                                    value={field.value}
                                    onChange={field.onChange}
                                    options={SUPPORT_TYPES}
                                />
                            )}
                        />
                    </FormField>

                    <FormField
                        label="Title of the artwork"
                        htmlFor="titleOfArtwork"
                        description={errors.titleOfArtwork?.message}
                    >
                        <Controller
                            name="titleOfArtwork"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    id="titleOfArtwork"
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    placeholder="Artwork title"
                                />
                            )}
                        />
                    </FormField>

                    <FormField
                        label="State"
                        required
                        htmlFor="state"
                        description={errors.state?.message}
                    >
                        <Controller
                            name="state"
                            control={control}
                            render={({ field }) => (
                                <SelectField
                                    id="state"
                                    value={field.value}
                                    onChange={field.onChange}
                                    options={ARTWORK_STATES}
                                />
                            )}
                        />
                    </FormField>

                    <FormField
                        label="Year of the artwork"
                        required
                        htmlFor="yearOfArtwork"
                        description={errors.yearOfArtwork?.message}
                    >
                        <Controller
                            name="yearOfArtwork"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    id="yearOfArtwork"
                                    type="number"
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="e.g., 2020"
                                />
                            )}
                        />
                    </FormField>

                    <FormField
                        label="Dimensions (cm)"
                        required
                        description={
                            errors.dimensions?.height?.message ||
                            errors.dimensions?.width?.message ||
                            (errors.dimensions as any)?.message
                        }
                    >
                        <div className="grid grid-cols-3 gap-2">
                            <Controller
                                name="dimensions.height"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        placeholder="Height*"
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            <Controller
                                name="dimensions.width"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        placeholder="Width*"
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            <Controller
                                name="dimensions.depth"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        placeholder="Depth"
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        </div>
                    </FormField>

                    <FormField
                        label="Is the work framed?"
                        required
                        htmlFor="isFramed"
                        description={errors.isFramed?.message}
                    >
                        <Controller
                            name="isFramed"
                            control={control}
                            render={({ field }) => (
                                <SelectField
                                    id="isFramed"
                                    value={field.value}
                                    onChange={field.onChange}
                                    options={YES_NO_OPTIONS}
                                />
                            )}
                        />
                    </FormField>

                    <FormField
                        label="Weight (kg)"
                        required
                        htmlFor="weight"
                        description={errors.weight?.message}
                    >
                        <Controller
                            name="weight"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    id="weight"
                                    type="number"
                                    step="0.1"
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="e.g., 2.5"
                                />
                            )}
                        />
                    </FormField>

                    <FormField
                        label="Hand delivery accepted"
                        required
                        htmlFor="handDeliveryAccepted"
                        description={errors.handDeliveryAccepted?.message}
                    >
                        <Controller
                            name="handDeliveryAccepted"
                            control={control}
                            render={({ field }) => (
                                <SelectField
                                    id="handDeliveryAccepted"
                                    value={field.value}
                                    onChange={field.onChange}
                                    options={YES_NO_OPTIONS}
                                />
                            )}
                        />
                    </FormField>

                    <FormField
                        label="Origin"
                        required
                        htmlFor="origin"
                        description={errors.origin?.message}
                    >
                        <Controller
                            name="origin"
                            control={control}
                            render={({ field }) => (
                                <SelectField
                                    id="origin"
                                    value={field.value}
                                    onChange={field.onChange}
                                    options={ORIGIN_OPTIONS}
                                />
                            )}
                        />
                    </FormField>

                    <FormField
                        label="Year of acquisition (for private sellers)"
                        htmlFor="yearOfAcquisition"
                        description={errors.yearOfAcquisition?.message}
                    >
                        <Controller
                            name="yearOfAcquisition"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    id="yearOfAcquisition"
                                    type="number"
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    placeholder="e.g., 2018"
                                />
                            )}
                        />
                    </FormField>
                </div>
            </div>
        </div>
    )
}
