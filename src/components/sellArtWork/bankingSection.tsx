import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import type { ArtworkFormData } from "@/lib/schemas/artwork.schema";

interface BankingSectionProps {
  control: Control<ArtworkFormData>;
  errors: FieldErrors<ArtworkFormData>;
  formData?: ArtworkFormData;
}

/**
 * Banking Section Component
 * Contains banking information and terms acceptance checkboxes
 * Uses React Hook Form Controller for form state management
 */
export function BankingSection({ control, errors, formData }: BankingSectionProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">
        5/ My banking information<span className="text-destructive">*</span>
      </h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="accountHolder">
            Account Holder <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="accountHolder"
            control={control}
            render={({ field }) => (
              <Input
                id="accountHolder"
                value={field.value}
                onChange={field.onChange}
                placeholder="Full name"
              />
            )}
          />
          {errors.accountHolder && (
            <p className="text-sm text-destructive">
              {errors.accountHolder.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="iban">
              IBAN <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="iban"
              control={control}
              render={({ field }) => (
                <Input
                  id="iban"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="FR76 1234 5678 9012 3456 7890 123"
                />
              )}
            />
            {errors.iban && (
              <p className="text-sm text-destructive">{errors.iban.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bicCode">BIC code</Label>
            <Controller
              name="bicCode"
              control={control}
              render={({ field }) => (
                <Input
                  id="bicCode"
                  value={field.value || ""}
                  onChange={field.onChange}
                  placeholder="BNPAFRPP"
                />
              )}
            />
            {errors.bicCode && (
              <p className="text-sm text-destructive">
                {errors.bicCode.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-start gap-2">
            <Controller
              name="acceptTermsOfSale"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="acceptTermsOfSale"
                  checked={field.value || false}
                  onCheckedChange={(checked) => {
                    field.onChange(checked === true);
                  }}
                />
              )}
            />
            <Label
              htmlFor="acceptTermsOfSale"
              className="text-sm font-normal cursor-pointer"
            >
              I accept{" "}
              <a href="#" className="text-primary underline">
                the terms of sale
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary underline">
                privacy policy
              </a>
              <span className="text-destructive">*</span>
            </Label>
          </div>
          {errors.acceptTermsOfSale && (
            <p className="text-sm text-destructive">
              {errors.acceptTermsOfSale.message}
            </p>
          )}

          <div className="flex items-start gap-2">
            <Controller
              name="giveSalesMandate"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="giveSalesMandate"
                  checked={field.value || false}
                  onCheckedChange={(checked) => {
                    field.onChange(checked === true);
                  }}
                />
              )}
            />
            <Label
              htmlFor="giveSalesMandate"
              className="text-sm font-normal cursor-pointer"
            >
              I agree to give{" "}
              <a href="#" className="text-primary underline">
                sales mandate
              </a>{" "}
              to Artalistic
              <span className="text-destructive">*</span>
            </Label>
          </div>
          {errors.giveSalesMandate && (
            <p className="text-sm text-destructive">
              {errors.giveSalesMandate.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
