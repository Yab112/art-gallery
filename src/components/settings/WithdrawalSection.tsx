import { useState } from "react";
import { useGetWithdrawals } from "@/services/artist/useGetWithdrawals";
import { useRequestWithdrawal } from "@/services/artist/useRequestWithdrawal";
import { useGetEarnings } from "@/services/artist/useGetEarnings";
import { useGetPaymentMethods } from "@/services/artist/useGetPaymentMethods";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowDownCircle, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export function WithdrawalSection() {
  const { data: earningsData } = useGetEarnings();
  const { data: withdrawalsData, isLoading } = useGetWithdrawals();
  const { data: paymentMethodsData } = useGetPaymentMethods();
  const { mutateAsync: requestWithdrawal, isPending } = useRequestWithdrawal();

  const [amount, setAmount] = useState("");
  const [selectedIban, setSelectedIban] = useState("");

  const availableBalance = earningsData?.data.availableBalance || 0;
  const paymentMethods = paymentMethodsData?.data || [];
  const withdrawals = withdrawalsData?.data || [];

  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    const withdrawalAmount = parseFloat(amount);

    if (!withdrawalAmount || withdrawalAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (withdrawalAmount < 10) {
      toast.error("Minimum withdrawal amount is $10");
      return;
    }

    if (withdrawalAmount > availableBalance) {
      toast.error(`Insufficient balance. Available: $${availableBalance.toFixed(2)}`);
      return;
    }

    if (!selectedIban) {
      toast.error("Please select a payment method");
      return;
    }

    try {
      const response = await requestWithdrawal({
        amount: withdrawalAmount,
        iban: selectedIban,
      });

      if (response.success) {
        toast.success(response.message || "Withdrawal request submitted successfully");
        setAmount("");
      } else {
        toast.error("Failed to submit withdrawal request");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to submit withdrawal request");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'FAILED':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Request Withdrawal Form */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
            <ArrowDownCircle className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Request Withdrawal</h3>
            <p className="text-sm text-gray-600">
              Available balance: <span className="font-semibold text-purple-600">${availableBalance.toFixed(2)}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleWithdrawalRequest} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="10"
              max={availableBalance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount (min $10)"
              disabled={isPending || availableBalance < 10}
            />
            <p className="text-xs text-gray-500">Minimum withdrawal: $10.00</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="iban">Payment Method</Label>
            {paymentMethods.length > 0 ? (
              <select
                id="iban"
                value={selectedIban}
                onChange={(e) => setSelectedIban(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={isPending}
              >
                <option value="">Select payment method</option>
                {paymentMethods.map((pm, index) => (
                  <option key={index} value={pm.iban}>
                    {pm.accountHolder} - {pm.iban.slice(0, 8)}...{pm.iban.slice(-4)}
                  </option>
                ))}
              </select>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-sm text-yellow-700">
                  No payment method found. Please add your bank account information when listing artwork.
                </p>
              </div>
            )}
          </div>

          {availableBalance < 10 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-sm text-yellow-700">
                Your available balance is below the minimum withdrawal amount of $10.
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending || availableBalance < 10 || !selectedIban}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isPending ? "Processing..." : "Request Withdrawal"}
          </Button>
        </form>
      </div>

      {/* Withdrawal History */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Withdrawal History</h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-purple-600" />
          </div>
        ) : withdrawals.length > 0 ? (
          <div className="space-y-3">
            {withdrawals.map((withdrawal) => (
              <div
                key={withdrawal.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(withdrawal.status)}
                  <div>
                    <p className="font-medium text-gray-900">${withdrawal.amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">
                      {withdrawal.payoutAccount.slice(0, 8)}...{withdrawal.payoutAccount.slice(-4)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(withdrawal.status)}`}>
                    {withdrawal.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(withdrawal.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ArrowDownCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No withdrawal requests yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
