"use client";

import { Input } from "@/components/ui/input";
import type { ArtworkFormData } from "@/lib/types/selart.type";
import {
  ARTWORK_TYPES,
  SUPPORT_TYPES,
  ARTWORK_STATES,
  YES_NO_OPTIONS,
  ORIGIN_OPTIONS,
} from "@/lib/constants/srtsell.constant";
import { FormField } from "./formField";
import { SelectField } from "./selectField";

interface ArtworkInfoSectionProps {
  formData: ArtworkFormData;
  onChange: (field: keyof ArtworkFormData, value: any) => void;
}

export function ArtworkInfoSection({
  formData,
  onChange,
}: ArtworkInfoSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">
          1/ Information about the artwork for sale
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Type of artwork" required htmlFor="typeOfArtwork">
            <SelectField
              id="typeOfArtwork"
              value={formData.typeOfArtwork}
              onChange={(value) => onChange("typeOfArtwork", value)}
              options={ARTWORK_TYPES}
            />
          </FormField>

          <FormField label="Technique" required htmlFor="technique">
            <Input
              id="technique"
              value={formData.technique}
              onChange={(e) => onChange("technique", e.target.value)}
              placeholder="e.g., Oil on canvas, Bronze casting"
            />
          </FormField>

          <FormField label="Artist" required htmlFor="artist">
            <Input
              id="artist"
              value={formData.artist}
              onChange={(e) => onChange("artist", e.target.value)}
              placeholder="Artist name"
            />
          </FormField>

          <FormField label="Support" required htmlFor="support">
            <SelectField
              id="support"
              value={formData.support}
              onChange={(value) => onChange("support", value)}
              options={SUPPORT_TYPES}
            />
          </FormField>

          <FormField label="Title of the artwork" htmlFor="titleOfArtwork">
            <Input
              id="titleOfArtwork"
              value={formData.titleOfArtwork}
              onChange={(e) => onChange("titleOfArtwork", e.target.value)}
              placeholder="Artwork title"
            />
          </FormField>

          <FormField label="State" required htmlFor="state">
            <SelectField
              id="state"
              value={formData.state}
              onChange={(value) => onChange("state", value)}
              options={ARTWORK_STATES}
            />
          </FormField>

          <FormField
            label="Year of the artwork"
            required
            htmlFor="yearOfArtwork"
          >
            <Input
              id="yearOfArtwork"
              type="number"
              value={formData.yearOfArtwork}
              onChange={(e) => onChange("yearOfArtwork", e.target.value)}
              placeholder="e.g., 2020"
            />
          </FormField>

          <FormField label="Dimensions (cm)" required>
            <div className="grid grid-cols-3 gap-2">
              <Input
                placeholder="Height*"
                value={formData.dimensions.height}
                onChange={(e) =>
                  onChange("dimensions", {
                    ...formData.dimensions,
                    height: e.target.value,
                  })
                }
              />
              <Input
                placeholder="Width*"
                value={formData.dimensions.width}
                onChange={(e) =>
                  onChange("dimensions", {
                    ...formData.dimensions,
                    width: e.target.value,
                  })
                }
              />
              <Input
                placeholder="Depth"
                value={formData.dimensions.depth || ""}
                onChange={(e) =>
                  onChange("dimensions", {
                    ...formData.dimensions,
                    depth: e.target.value,
                  })
                }
              />
            </div>
          </FormField>

          <FormField label="Is the work framed?" required htmlFor="isFramed">
            <SelectField
              id="isFramed"
              value={formData.isFramed}
              onChange={(value) => onChange("isFramed", value)}
              options={YES_NO_OPTIONS}
            />
          </FormField>

          <FormField label="Weight (kg)" required htmlFor="weight">
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={formData.weight}
              onChange={(e) => onChange("weight", e.target.value)}
              placeholder="e.g., 2.5"
            />
          </FormField>

          <FormField
            label="Hand delivery accepted"
            required
            htmlFor="handDeliveryAccepted"
          >
            <SelectField
              id="handDeliveryAccepted"
              value={formData.handDeliveryAccepted}
              onChange={(value) => onChange("handDeliveryAccepted", value)}
              options={YES_NO_OPTIONS}
            />
          </FormField>

          <FormField label="Origin" required htmlFor="origin">
            <SelectField
              id="origin"
              value={formData.origin}
              onChange={(value) => onChange("origin", value)}
              options={ORIGIN_OPTIONS}
            />
          </FormField>

          <FormField
            label="Year of acquisition (for private sellers)"
            htmlFor="yearOfAcquisition"
          >
            <Input
              id="yearOfAcquisition"
              type="number"
              value={formData.yearOfAcquisition}
              onChange={(e) => onChange("yearOfAcquisition", e.target.value)}
              placeholder="e.g., 2018"
            />
          </FormField>
        </div>
      </div>
    </div>
  );
}
