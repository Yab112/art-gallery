import { useState, useEffect } from "react";
import { useGetPaymentMethods } from "@/services/artist/useGetPaymentMethods";
import { useUpdatePaymentMethod } from "@/services/artist/useUpdatePaymentMethod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

interface PaymentMethodFormData {
  accountHolder: string;
  iban: string;
  bicCode: string;
}

export function PaymentMethodSection() {
  const { data: paymentMethodsData, isLoading } = useGetPaymentMethods();
  const { mutateAsync: updatePaymentMethod, isPending } = useUpdatePaymentMethod();

  const paymentMethods = paymentMethodsData?.data || [];
  const currentMethod = paymentMethods[0]; // Use first payment method

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PaymentMethodFormData>({
    defaultValues: {
      accountHolder: "",
      iban: "",
      bicCode: "",
    },
  });

  // Update form when payment method data loads
  useEffect(() => {
    if (currentMethod) {
      reset({
        accountHolder: currentMethod.accountHolder,
        iban: currentMethod.iban,
        bicCode: currentMethod.bicCode || "",
      });
    }
  }, [currentMethod, reset]);

  const onSubmit = async (data: PaymentMethodFormData) => {
    try {
      const response = await updatePaymentMethod({
        accountHolder: data.accountHolder,
        iban: data.iban,
        bicCode: data.bicCode || undefined,
      });

      if (response.success) {
        toast.success(
          `Payment method updated! ${response.data.artworksUpdated} artwork(s) updated.`
        );
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to update payment method"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
            <p className="text-sm text-gray-600">
              Update your default bank account for receiving payments
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Important Information</p>
              <ul className="list-disc ml-4 space-y-1">
                <li>This will update the payment information for ALL your artworks</li>
                <li>Withdrawals will be sent to this bank account</li>
                <li>Make sure your account details are accurate to avoid payment delays</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="accountHolder">
              Account Holder Name <span className="text-red-600">*</span>
            </Label>
            <Input
              id="accountHolder"
              {...register("accountHolder", {
                required: "Account holder name is required",
              })}
              placeholder="Full name as it appears on your bank account"
            />
            {errors.accountHolder && (
              <p className="text-sm text-red-500">{errors.accountHolder.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="iban">
              IBAN <span className="text-red-600">*</span>
            </Label>
            <Input
              id="iban"
              {...register("iban", {
                required: "IBAN is required",
                pattern: {
                  value: /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/,
                  message: "Invalid IBAN format",
                },
              })}
              placeholder="FR76 1234 5678 9012 3456 7890 123"
            />
            {errors.iban && (
              <p className="text-sm text-red-500">{errors.iban.message}</p>
            )}
            <p className="text-xs text-gray-500">
              International Bank Account Number (IBAN)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bicCode">BIC/SWIFT Code</Label>
            <Input
              id="bicCode"
              {...register("bicCode")}
              placeholder="BNPAFRPP (Optional)"
            />
            <p className="text-xs text-gray-500">
              Bank Identifier Code (BIC) or SWIFT code
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white"
            >
              <Save className="h-4 w-4" />
              {isPending ? "Saving..." : "Save Payment Method"}
            </Button>
          </div>
        </form>
      </div>

      {/* Current Payment Methods */}
      {paymentMethods.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Current Payment Information
          </h3>
          <div className="space-y-3">
            {paymentMethods.map((method, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{method.accountHolder}</p>
                    <p className="text-sm text-gray-600 font-mono mt-1">
                      {method.iban}
                    </p>
                    {method.bicCode && (
                      <p className="text-sm text-gray-500 mt-1">
                        BIC: {method.bicCode}
                      </p>
                    )}
                  </div>
                  <CreditCard className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
