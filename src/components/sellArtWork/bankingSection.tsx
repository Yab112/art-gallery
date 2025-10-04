"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import type { ArtworkFormData } from "@/lib/types/selart.type"

interface BankingSectionProps {
  formData: ArtworkFormData
  onChange: (field: keyof ArtworkFormData, value: any) => void
}

export function BankingSection({ formData, onChange }: BankingSectionProps) {
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
          <Input
            id="accountHolder"
            value={formData.accountHolder}
            onChange={(e) => onChange("accountHolder", e.target.value)}
            placeholder="Full name"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="iban">
              IBAN <span className="text-destructive">*</span>
            </Label>
            <Input
              id="iban"
              value={formData.iban}
              onChange={(e) => onChange("iban", e.target.value)}
              placeholder="FR76 1234 5678 9012 3456 7890 123"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bicCode">
              BIC code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="bicCode"
              value={formData.bicCode}
              onChange={(e) => onChange("bicCode", e.target.value)}
              placeholder="BNPAFRPP"
            />
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-start gap-2">
            <Checkbox
              id="acceptTermsOfSale"
              checked={formData.acceptTermsOfSale}
              onCheckedChange={(checked) => onChange("acceptTermsOfSale", checked === true)}
            />
            <Label htmlFor="acceptTermsOfSale" className="text-sm font-normal cursor-pointer">
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

          <div className="flex items-start gap-2">
            <Checkbox
              id="giveSalesMandate"
              checked={formData.giveSalesMandate}
              onCheckedChange={(checked) => onChange("giveSalesMandate", checked === true)}
            />
            <Label htmlFor="giveSalesMandate" className="text-sm font-normal cursor-pointer">
              I agree to give{" "}
              <a href="#" className="text-primary underline">
                sales mandate
              </a>{" "}
              to Artalistic
              <span className="text-destructive">*</span>
            </Label>
          </div>
        </div>
      </div>
    </div>
  )
}
