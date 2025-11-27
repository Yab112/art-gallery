import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAvatarUrl } from "@/utils/avatar";
import { Badge } from "@/components/ui/badge";

interface TalentType {
  id: string;
  name: string;
  slug: string;
}

interface Artist {
  id: string;
  name: string;
  email?: string;
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
  talentTypes?: TalentType[];
}

interface ArtistCardProps {
  artist: Artist;
  showSales?: boolean;
}

export function ArtistCard({ artist, showSales }: ArtistCardProps) {
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  // Debug: Log artist data
  if (process.env.NODE_ENV === 'development') {
    console.log('ArtistCard - Artist data:', {
      id: artist.id,
      name: artist.name,
      email: artist.email,
      talentTypes: artist.talentTypes,
    });
  }

  // Get avatar URL with fallback to placeholder service
  const avatarUrl = getAvatarUrl(artist.avatar, artist.name, 200);
  const displayUrl = imageError
    ? getAvatarUrl(null, artist.name, 200)
    : avatarUrl;

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
    }
  };

  const handleClick = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 ArtistCard clicked - Navigating to artist page:', {
        artistId: artist.id,
        artistName: artist.name,
        artistEmail: artist.email,
        talentTypes: artist.talentTypes,
      });
    }
    navigate(`/artist/${artist.id}`);
  };

  return (
    <div className="flex flex-col items-center p-4 cursor-pointer" onClick={handleClick}>
      {/* Avatar - Clickable */}
      <div className="relative mb-3">
        <img
          src={displayUrl}
          alt={artist.name}
          onError={handleImageError}
          className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-gray-100 shadow-md"
        />
        {artist.rating && (
          <div className="absolute -top-1 -right-1 bg-yellow-400 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
            <span className="text-xs font-semibold">{artist.rating}</span>
          </div>
        )}
      </div>

      {/* Name */}
      <div className="text-center mb-2 w-full">
        <h3 className="font-bold text-base sm:text-lg mb-1 text-gray-900 line-clamp-1">
          {artist.name}
        </h3>
      </div>

      {/* Email - Low opacity - Always show if available */}
      <div className="text-center mb-2 w-full min-h-[20px]">
        {artist.email ? (
          <p className="text-xs sm:text-sm text-gray-400 opacity-60 line-clamp-1">
            {artist.email}
          </p>
        ) : (
          <p className="text-xs sm:text-sm text-transparent">-</p>
        )}
      </div>

      {/* Talent Types - Low opacity - Always show space */}
      <div className="mb-2 w-full min-h-[24px]">
        {artist.talentTypes && artist.talentTypes.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 justify-center">
            {artist.talentTypes.slice(0, 2).map((talentType) => (
              <Badge
                key={talentType.id}
                variant="secondary"
                className="text-xs bg-red-50 text-red-700 border-red-200 px-2 py-0.5 opacity-60"
              >
                {talentType.name}
              </Badge>
            ))}
            {artist.talentTypes.length > 2 && (
              <Badge
                variant="secondary"
                className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 opacity-60"
              >
                +{artist.talentTypes.length - 2}
              </Badge>
            )}
          </div>
        ) : (
          <div className="h-6"></div>
        )}
      </div>
    </div>
  );
}
