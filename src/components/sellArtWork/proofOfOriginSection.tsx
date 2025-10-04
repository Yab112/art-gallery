"use client"

import type { ArtworkFormData } from "@/lib/types/selart.type"
import { ACCEPTED_DOCUMENT_FORMATS, MAX_FILE_SIZE_MB } from "@/lib/constants/srtsell.constant"
import { FormField } from "./formField"
import { FileUploadBox } from "./fileUploadBox"

interface ProofOfOriginSectionProps {
  formData: ArtworkFormData
  onChange: (field: keyof ArtworkFormData, value: any) => void
}

export function ProofOfOriginSection({ formData, onChange }: ProofOfOriginSectionProps) {
  return (
    <FormField label="Proof of origin" required htmlFor="proofOfOrigin">
      <FileUploadBox
        id="proofOfOrigin"
        file={formData.proofOfOrigin}
        onFileSelect={(file) => onChange("proofOfOrigin", file)}
        onRemove={() => onChange("proofOfOrigin", null)}
        acceptedFormats={ACCEPTED_DOCUMENT_FORMATS}
        label="Add document"
      />
      <p className="text-xs text-muted-foreground mt-2">
        Maximum file size {MAX_FILE_SIZE_MB} MB. (Accepted formats: jpg, pdf)
      </p>
    </FormField>
  )
}
