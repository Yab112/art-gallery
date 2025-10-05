import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import type { ArtworkFormData } from "@/lib/schemas/artwork.schema";
import {
  COMMISSION_RATE,
  TAX_RATE,
  PRICE_NEGOTIATION_OPTIONS,
} from "@/lib/constants/srtsell.constant";

interface PriceSectionProps {
  control: Control<ArtworkFormData>;
  errors: FieldErrors<ArtworkFormData>;
  formData: ArtworkFormData;
}

/**
 * Price Section Component
 * Contains pricing information and commission calculations
 * Uses React Hook Form Controller for form state management
 */
export function PriceSection({ control, errors, formData }: PriceSectionProps) {
  const calculateNetPrice = () => {
    const price = Number.parseFloat(formData.desiredPrice) || 0;
    const commission = price * COMMISSION_RATE;
    const taxes = price * TAX_RATE;
    return price - commission - taxes;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">4/ Price*</h3>
      <p className="text-sm text-muted-foreground">
        What price would you like to sell your piece for? Find out how much
        money you will receive after Artalistic's commission is deducted.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="desiredPrice">
            Desired price (in euros) <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="desiredPrice"
            control={control}
            render={({ field }) => (
              <Input
                id="desiredPrice"
                type="number"
                step="0.01"
                value={field.value}
                onChange={field.onChange}
                placeholder="0.00"
              />
            )}
          />
          {errors.desiredPrice && (
            <p className="text-sm text-destructive">
              {errors.desiredPrice.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            For you (commission {(COMMISSION_RATE * 100).toFixed(0)}% + taxes)
          </Label>
          <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-muted-foreground">
            {calculateNetPrice().toFixed(2)} €
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="acceptPriceNegotiation">
          Accept price negotiation <span className="text-destructive">*</span>
        </Label>
        <Controller
          name="acceptPriceNegotiation"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="acceptPriceNegotiation">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {PRICE_NEGOTIATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.acceptPriceNegotiation && (
          <p className="text-sm text-destructive">
            {errors.acceptPriceNegotiation.message}
          </p>
        )}
      </div>
    </div>
  );
}
