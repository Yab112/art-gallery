"use client";

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

export function PriceSection({ control, errors, formData }: PriceSectionProps) {
  const calculateNetPrice = () => {
    // Remove $ and commas, then parse
    const priceStr = formData.desiredPrice?.replace(/[$,]/g, "") || "0";
    const price = Number.parseFloat(priceStr) || 0;
    const commission = price * COMMISSION_RATE;
    const taxes = price * TAX_RATE;
    return price - commission - taxes;
  };

  // Format number with dollar sign and commas
  const formatCurrency = (value: string): string => {
    // Remove all non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, "");
    if (!numericValue) return "";
    
    // Split by decimal point
    const parts = numericValue.split(".");
    const integerPart = parts[0] || "";
    const decimalPart = parts[1] || "";
    
    // Add commas to integer part
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    
    // Combine with dollar sign
    if (decimalPart) {
      return `$${formattedInteger}.${decimalPart}`;
    }
    return formattedInteger ? `$${formattedInteger}` : "";
  };

  // Parse currency value (remove $ and commas)
  const parseCurrency = (value: string): string => {
    return value.replace(/[$,]/g, "");
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
            Desired price (in $) <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="desiredPrice"
            control={control}
            render={({ field }) => {
              const displayValue = field.value ? formatCurrency(field.value) : "";
              
              return (
                <div className="relative">
                  <Input
                    id="desiredPrice"
                    type="text"
                    value={displayValue}
                    onChange={(e) => {
                      const rawValue = parseCurrency(e.target.value);
                      field.onChange(rawValue);
                    }}
                    onBlur={field.onBlur}
                    placeholder="$0.00"
                    className="pl-8"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                </div>
              );
            }}
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
            ${calculateNetPrice().toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
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
            <Select
              value={field.value}
              onValueChange={field.onChange}
              {...({ modal: false } as any)}
            >
              <SelectTrigger id="acceptPriceNegotiation">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4}>
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
