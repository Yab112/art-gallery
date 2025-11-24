import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { getAvatarUrl } from "@/utils/avatar";
import { useState } from "react";

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
}

export function ArtistCard({
  artist,
}: ArtistCardProps) {
  const [imageError, setImageError] = useState(false);
  
  // Get avatar URL with fallback to placeholder service
  const avatarUrl = getAvatarUrl(artist.avatar, artist.name, 80);
  const displayUrl = imageError ? getAvatarUrl(null, artist.name, 80) : avatarUrl;

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-5 w-full">
      {/* Avatar */}
      <div className="relative mb-4 flex justify-center">
        <div className="relative">
        <img
            src={displayUrl}
          alt={artist.name}
            onError={handleImageError}
            className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-gray-100"
        />
        {artist.rating && (
            <div className="absolute -top-1 -right-1 bg-yellow-400 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
              <Star className="h-3 w-3 fill-current" />
              <span className="text-xs font-semibold">{artist.rating}</span>
          </div>
        )}
      </div>
      </div>

      {/* Artist name */}
      <h3 className="font-bold text-sm lg:text-base mb-3 text-center text-gray-900 line-clamp-1">
        {artist.name}
      </h3>

      {/* Stats */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
          <span className="font-medium text-gray-900">{artist.artworks}</span>
          <span>artworks</span>
        </div>

        {artist.country && artist.country !== "Unknown" && (
          <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
            <span>{artist.country}</span>
          </div>
        )}
      </div>

      {/* View Profile Button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs h-9 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 transition-colors"
      >
        View Profile
      </Button>
    </div>
  );
}
