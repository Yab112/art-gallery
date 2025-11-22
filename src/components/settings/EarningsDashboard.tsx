import { useGetEarnings } from "@/services/artist/useGetEarnings";
import { DollarSign, TrendingUp, Package, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";

export function EarningsDashboard() {
  const { data, isLoading, error } = useGetEarnings();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-red-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-700">Failed to load earnings data. Please try again later.</p>
      </div>
    );
  }

  if (!data?.success) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-700">No earnings data available.</p>
      </div>
    );
  }

  const earnings = data.data;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <Card className="p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${earnings.totalSales.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {earnings.salesCount} {earnings.salesCount === 1 ? 'sale' : 'sales'}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Platform Commission */}
        <Card className="p-6 border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Platform Fee (10%)</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${earnings.totalCommission.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Commission deducted</p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>

        {/* Your Earnings */}
        <Card className="p-6 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Your Earnings (90%)</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${earnings.totalEarnings.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Total earned</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Available Balance */}
        <Card className="p-6 border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-semibold">Available Balance</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                ${earnings.availableBalance.toFixed(2)}
              </p>
              <p className="text-xs text-purple-600 mt-1">Ready to withdraw</p>
            </div>
            <div className="h-12 w-12 bg-purple-200 rounded-full flex items-center justify-center">
              <Wallet className="h-6 w-6 text-purple-700" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Sales */}
      {earnings.sales && earnings.sales.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sales</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Artwork</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Sale Price</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Platform Fee</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Your Earnings</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {earnings.sales.slice(0, 5).map((sale) => (
                  <tr key={sale.artworkId} className="border-b last:border-b-0 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        {sale.artworkImage && (
                          <img
                            src={sale.artworkImage}
                            alt={sale.artworkTitle}
                            className="w-10 h-10 object-cover rounded"
                          />
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {sale.artworkTitle || 'Untitled'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-900">
                      ${sale.salePrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-sm text-orange-600">
                      -${sale.commission.toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-sm font-semibold text-green-600">
                      ${sale.earnings.toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-600">
                      {new Date(sale.soldAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Sales Message */}
      {(!earnings.sales || earnings.sales.length === 0) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Sales Yet</h3>
          <p className="text-gray-600">
            Your sales will appear here once someone purchases your artwork.
          </p>
        </div>
      )}
    </div>
  );
}
