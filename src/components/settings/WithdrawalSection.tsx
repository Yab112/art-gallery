import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/hooks/use-axios-auth";
import { Wallet, Plus, Clock, CheckCircle, XCircle } from "lucide-react";
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

interface Withdrawal {
  id: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
  requestedAt: string;
  completedAt?: string;
  paymentMethod?: string;
  reason?: string;
}

export function WithdrawalSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, error, refetch } = useQuery<{
    withdrawals: Withdrawal[];
    availableBalance: number;
  }>({
    queryKey: ["withdrawals"],
    queryFn: async () => {
      const response = await api.get("/settings/withdrawals");
      return response.data;
    },
  });

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawalAmount);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (data && amount > data.availableBalance) {
      toast.error("Amount exceeds available balance");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/settings/withdrawals", { amount });
      toast.success("Withdrawal request submitted successfully");
      setIsDialogOpen(false);
      setWithdrawalAmount("");
      refetch();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to submit withdrawal request"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
      case "APPROVED":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
      case "APPROVED":
        return "text-green-600 bg-green-50";
      case "REJECTED":
        return "text-red-600 bg-red-50";
      case "PENDING":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={Wallet}
        title="Error Loading Withdrawals"
        description="Failed to load your withdrawal history. Please try again later."
      />
    );
  }

  const withdrawals = data?.withdrawals || [];
  const availableBalance = data?.availableBalance || 0;

  return (
    <div className="space-y-6">
      {/* Available Balance */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600 mb-1">
              Available Balance
            </p>
            <p className="text-3xl font-bold text-blue-900">
              ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Request Withdrawal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Withdrawal</DialogTitle>
                <DialogDescription>
                  Enter the amount you want to withdraw from your earnings.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleWithdrawal} className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    max={availableBalance}
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Available: ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Withdrawal History */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Withdrawal History
        </h3>
        {withdrawals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No withdrawal requests yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {withdrawals.map((withdrawal) => (
              <div
                key={withdrawal.id}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(withdrawal.status)}
                    <div>
                      <p className="font-medium text-gray-900">
                        ${withdrawal.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(withdrawal.requestedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        withdrawal.status
                      )}`}
                    >
                      {withdrawal.status}
                    </span>
                  </div>
                </div>
                {withdrawal.reason && (
                  <p className="text-sm text-gray-600 mt-2">
                    Reason: {withdrawal.reason}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

