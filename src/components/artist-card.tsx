import { Button } from "@/components/ui/button";
import { Heart, Eye, ShoppingBag, TrendingUp } from "lucide-react";

interface ArtistCardProps {
  name: string;
  nationality?: string;
  birthYear?: string;
  deathYear?: string;
  avatar: string;
  artworkCount?: number;
  totalViews?: number;
  totalLikes?: number;
  totalSales?: number;
  salesCount?: number;
  totalEarnings?: number;
  onFollow?: () => void;
}

export function ArtistCard({
  name,
  nationality,
  birthYear,
  deathYear,
  avatar,
  artworkCount,
  totalViews,
  totalLikes,
  totalSales,
  salesCount,
  totalEarnings,
  onFollow,
}: ArtistCardProps) {
  const formatLifespan = () => {
    if (!nationality && !birthYear) return "";

    let result = "";
    if (nationality) result += nationality;
    if (birthYear) {
      if (nationality) result += ", ";
      result += deathYear ? `${birthYear}-${deathYear}` : `b.${birthYear}`;
    }
    return result;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  return (
    <div className="group flex flex-col items-center text-center p-6 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      {/* Circular Avatar */}
      <div className="relative mb-4">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 group-hover:border-gray-300 transition-colors">
          <img
            src={avatar || "/placeholder.svg"}
            alt={`${name} - Artist`}
            className="w-full h-full object-cover"
          />
        </div>
        {salesCount !== undefined && salesCount > 0 && (
          <div className="absolute -bottom-1 -right-1 flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full text-xs font-bold shadow-lg">
            {salesCount}
          </div>
        )}
      </div>

      {/* Artist Name */}
      <div className="mb-3">
        <h3 className="cursor-pointer font-semibold text-gray-900 text-lg hover:text-gray-700 transition-colors mb-1">
          {name}
        </h3>
        {formatLifespan() && (
          <p className="text-gray-500 text-sm">{formatLifespan()}</p>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 w-full mb-4 text-sm">
        {artworkCount !== undefined && (
          <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
            <span className="font-bold text-gray-900 text-base">{artworkCount}</span>
            <span className="text-gray-600 text-xs">Artworks</span>
          </div>
        )}
        {totalViews !== undefined && totalViews > 0 && (
          <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
            <div className="flex items-center gap-1 mb-1">
              <Eye className="h-4 w-4 text-gray-600" />
              <span className="font-bold text-gray-900">{formatNumber(totalViews)}</span>
            </div>
            <span className="text-gray-600 text-xs">Views</span>
          </div>
        )}
        {totalLikes !== undefined && totalLikes > 0 && (
          <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
            <div className="flex items-center gap-1 mb-1">
              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
              <span className="font-bold text-gray-900">{formatNumber(totalLikes)}</span>
            </div>
            <span className="text-gray-600 text-xs">Likes</span>
          </div>
        )}
        {totalSales !== undefined && totalSales > 0 && (
          <div className="flex flex-col items-center p-2 bg-green-50 rounded col-span-2">
            <div className="flex items-center gap-1 mb-1">
              <ShoppingBag className="h-4 w-4 text-green-600" />
              <span className="font-bold text-green-700">{formatCurrency(totalSales)}</span>
            </div>
            <span className="text-green-600 text-xs">Total Sales</span>
          </div>
        )}
      </div>

      {/* Profile Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onFollow}
        className="w-full rounded-full bg-transparent hover:bg-gray-50 border-gray-300"
      >
        View Profile
      </Button>
    </div>
  );
}
