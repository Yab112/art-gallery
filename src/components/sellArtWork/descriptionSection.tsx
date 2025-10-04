"use client"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { ArtworkFormData } from "@/lib/types/selart.type"
import { FORM_TIPS } from "@/lib/constants/srtsell.constant"

interface DescriptionSectionProps {
  formData: ArtworkFormData
  onChange: (field: keyof ArtworkFormData, value: any) => void
}

export function DescriptionSection({ formData, onChange }: DescriptionSectionProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="description">
        2/ Description of the artwork and remarks
        <span className="text-destructive">*</span>
      </Label>
      <Textarea
        id="description"
        value={formData.description}
        onChange={(e) => onChange("description", e.target.value)}
        placeholder={FORM_TIPS}
        className="min-h-32 resize-y"
      />
    </div>
  )
}
