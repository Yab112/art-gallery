import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Star, TrendingUp, Eye } from "lucide-react";

interface Artist {
  id: string;
  name: string;
  country: string;
  followers: number;
  artworks: number;
  avatar: string;
  tags?: string[];
  sales?: number;
  views?: number;
  rating?: number;
  isTopSelling?: boolean;
  isMostViewed?: boolean;
}

interface ArtistCardProps {
  artist: Artist;
  showSales?: boolean;
  showViews?: boolean;
}

export function ArtistCard({
  artist,
  showSales = false,
  showViews = false,
}: ArtistCardProps) {
  return (
    <div className="bg-white rounded-lg border p-3 lg:p-4 transition-none w-full">
      {/* Avatar */}
      <div className="relative mb-3 lg:mb-4">
        <img
          src={artist.avatar}
          alt={artist.name}
          className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 rounded-full mx-auto object-cover border-2 border-gray-200"
        />
        {artist.rating && (
          <div className="absolute -top-1 -right-1 bg-yellow-400 text-white text-xs px-1.5 py-0.5 lg:px-2 lg:py-1 rounded-full flex items-center gap-1">
            <Star className="h-2.5 w-2.5 lg:h-3 lg:w-3 fill-current" />
            <span className="text-xs">{artist.rating}</span>
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="w-full mb-2 lg:mb-3 text-xs h-7 lg:h-8 text-red-700 hover:text-red-800 hover:bg-transparent"
      >
        <Plus className="h-2.5 w-2.5 lg:h-3 lg:w-3 mr-1" />
        <span className="hidden sm:inline">Follow </span>({artist.followers}{" "}
        fans)
      </Button>

      {/* Artist name */}
      <h3 className="font-semibold text-xs sm:text-sm lg:text-sm mb-2 text-center truncate">
        {artist.name}
      </h3>

      {artist.tags && (
        <div className="flex flex-wrap gap-1 mb-2 lg:mb-3 justify-center">
          {artist.tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs px-1.5 py-0.5"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="text-xs text-gray-600 space-y-1.5 lg:space-y-2">
        <div className="flex justify-between items-center">
          <span>Country:</span>
          <span className="text-gray-800 font-medium truncate ml-1">
            {artist.country}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>Artworks:</span>
          <span className="text-gray-800 font-medium">{artist.artworks}</span>
        </div>

        {showSales && artist.sales && (
          <div className="flex justify-between items-center text-red-700">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
              <span>Sales:</span>
            </div>
            <span className="font-medium text-xs">
              ${artist.sales.toLocaleString()}
            </span>
          </div>
        )}

        {showViews && artist.views && (
          <div className="flex justify-between items-center text-red-700">
            <div className="flex items-center gap-1">
              <Eye className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
              <span>Views:</span>
            </div>
            <span className="font-medium text-xs">
              {artist.views.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="w-full mt-2 lg:mt-3 text-xs h-6 lg:h-7 text-gray-600"
      >
        View Profile
      </Button>
    </div>
  );
}
