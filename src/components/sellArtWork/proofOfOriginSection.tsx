import { Controller, type Control, type FieldErrors } from "react-hook-form";
import type { ArtworkFormData } from "@/lib/schemas/artwork.schema";
import {
  ACCEPTED_DOCUMENT_FORMATS,
  MAX_FILE_SIZE_MB,
} from "@/lib/constants/srtsell.constant";
import { FormField } from "./formField";
import { FileUploadBox } from "./fileUploadBox";

interface ProofOfOriginSectionProps {
  control: Control<ArtworkFormData>;
  errors: FieldErrors<ArtworkFormData>;
  setValue: (name: keyof ArtworkFormData, value: any) => void;
}

/**
 * Proof of Origin Section Component
 * Handles file upload for proof of origin documents
 * Uses React Hook Form Controller for form state management
 */
export function ProofOfOriginSection({
  control,
  errors,
  setValue,
}: ProofOfOriginSectionProps) {
  return (
    <FormField
      label="Proof of origin"
      htmlFor="proofOfOrigin"
      description={errors.proofOfOrigin?.message}
    >
      <Controller
        name="proofOfOrigin"
        control={control}
        render={({ field }) => (
          <FileUploadBox
            id="proofOfOrigin"
            file={field.value || null}
            onFileSelect={(file) => setValue("proofOfOrigin", file)}
            onRemove={() => setValue("proofOfOrigin", null)}
            acceptedFormats={ACCEPTED_DOCUMENT_FORMATS}
            label="Add document"
          />
        )}
      />
      <p className="text-xs text-muted-foreground mt-2">
        Maximum file size {MAX_FILE_SIZE_MB} MB. (Accepted formats: jpg, pdf)
      </p>
    </FormField>
  );
}
