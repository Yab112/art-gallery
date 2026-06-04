import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePlatformSettings } from "@/queries/settingsQueries";
import type { ArtworkFormData } from "@/lib/schemas/artwork.schema";
import { type Control, Controller, type FieldErrors } from "react-hook-form";

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
export function BankingSection({ control, errors }: BankingSectionProps) {
  const { data: platformSettings } = usePlatformSettings();
  const siteName = platformSettings?.settings?.siteName;
  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-xl">
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
            <p className="text-destructive text-sm">
              {errors.accountHolder.message}
            </p>
          )}
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
              className="cursor-pointer font-normal text-sm"
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
            <p className="text-destructive text-sm">
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
              className="cursor-pointer font-normal text-sm"
            >
              I agree to give{" "}
              <a href="#" className="text-primary underline">
                sales mandate
              </a>{" "}
              to {siteName}
              <span className="text-destructive">*</span>
            </Label>
          </div>
          {errors.giveSalesMandate && (
            <p className="text-destructive text-sm">
              {errors.giveSalesMandate.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
