import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/hooks/use-axios-auth";
import { CreditCard, Plus, Edit, Trash2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface PaymentMethod {
  id: string;
  type: "BANK_ACCOUNT" | "PAYPAL" | "MOBILE_MONEY";
  accountHolder?: string;
  accountNumber?: string;
  bankName?: string;
  iban?: string;
  paypalEmail?: string;
  phoneNumber?: string;
  isDefault: boolean;
}

export function PaymentMethodSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState({
    type: "BANK_ACCOUNT" as "BANK_ACCOUNT" | "PAYPAL" | "MOBILE_MONEY",
    accountHolder: "",
    accountNumber: "",
    bankName: "",
    iban: "",
    paypalEmail: "",
    phoneNumber: "",
  });

  const { data, isLoading, error, refetch } = useQuery<{
    paymentMethods: PaymentMethod[];
  }>({
    queryKey: ["payment-methods"],
    queryFn: async () => {
      const response = await api.get("/settings/payment-methods");
      return response.data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMethod) {
        await api.put(`/settings/payment-methods/${editingMethod.id}`, formData);
        toast.success("Payment method updated successfully");
      } else {
        await api.post("/settings/payment-methods", formData);
        toast.success("Payment method added successfully");
      }
      setIsDialogOpen(false);
      setEditingMethod(null);
      resetForm();
      refetch();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to save payment method"
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment method?")) {
      return;
    }
    try {
      await api.delete(`/settings/payment-methods/${id}`);
      toast.success("Payment method deleted successfully");
      refetch();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to delete payment method"
      );
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.patch(`/settings/payment-methods/${id}/set-default`);
      toast.success("Default payment method updated");
      refetch();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to set default payment method"
      );
    }
  };

  const resetForm = () => {
    setFormData({
      type: "BANK_ACCOUNT",
      accountHolder: "",
      accountNumber: "",
      bankName: "",
      iban: "",
      paypalEmail: "",
      phoneNumber: "",
    });
  };

  const openEditDialog = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      type: method.type,
      accountHolder: method.accountHolder || "",
      accountNumber: method.accountNumber || "",
      bankName: method.bankName || "",
      iban: method.iban || "",
      paypalEmail: method.paypalEmail || "",
      phoneNumber: method.phoneNumber || "",
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={CreditCard}
        title="Error Loading Payment Methods"
        description="Failed to load your payment methods. Please try again later."
      />
    );
  }

  const paymentMethods = data?.paymentMethods || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Payment Methods
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Manage how you receive payments from your artwork sales
          </p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingMethod(null);
              resetForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-red-700 hover:bg-red-800 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle>
                {editingMethod ? "Edit Payment Method" : "Add Payment Method"}
              </DialogTitle>
              <DialogDescription>
                Add a payment method to receive your earnings
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="type">Payment Type</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="BANK_ACCOUNT">Bank Account</option>
                  <option value="PAYPAL">PayPal</option>
                  <option value="MOBILE_MONEY">Mobile Money</option>
                </select>
              </div>

              {formData.type === "BANK_ACCOUNT" && (
                <>
                  <div>
                    <Label htmlFor="accountHolder">Account Holder Name</Label>
                    <Input
                      id="accountHolder"
                      value={formData.accountHolder}
                      onChange={(e) =>
                        setFormData({ ...formData, accountHolder: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={formData.accountNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, accountNumber: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={formData.bankName}
                      onChange={(e) =>
                        setFormData({ ...formData, bankName: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="iban">IBAN (Optional)</Label>
                    <Input
                      id="iban"
                      value={formData.iban}
                      onChange={(e) =>
                        setFormData({ ...formData, iban: e.target.value })
                      }
                    />
                  </div>
                </>
              )}

              {formData.type === "PAYPAL" && (
                <div>
                  <Label htmlFor="paypalEmail">PayPal Email</Label>
                  <Input
                    id="paypalEmail"
                    type="email"
                    value={formData.paypalEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, paypalEmail: e.target.value })
                    }
                    required
                  />
                </div>
              )}

              {formData.type === "MOBILE_MONEY" && (
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                    required
                  />
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingMethod(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-red-700 hover:bg-red-800">
                  {editingMethod ? "Update" : "Add"} Payment Method
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Payment Methods List */}
      {paymentMethods.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>No payment methods added yet.</p>
          <p className="text-sm mt-2">
            Add a payment method to receive your earnings
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">
                        {method.type === "BANK_ACCOUNT"
                          ? "Bank Account"
                          : method.type === "PAYPAL"
                            ? "PayPal"
                            : "Mobile Money"}
                      </p>
                      {method.isDefault && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {method.type === "BANK_ACCOUNT" && (
                        <>
                          {method.accountHolder} • {method.bankName} • ****
                          {method.accountNumber?.slice(-4)}
                        </>
                      )}
                      {method.type === "PAYPAL" && method.paypalEmail}
                      {method.type === "MOBILE_MONEY" && method.phoneNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!method.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(method.id)}
                    >
                      Set as Default
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(method)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(method.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

