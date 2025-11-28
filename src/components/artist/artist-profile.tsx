import { Button } from "@/components/ui/button";
import { Bell, Heart, Share2, MapPin, Globe, Palette } from "lucide-react";
import { useState } from "react";
import type { UserProfile } from "@/types/user.types";
import { getAvatarUrl } from "@/utils/avatar";
import { FollowButton } from "@/components/follow/follow-button";
import { useAuth } from "@/hooks/use-auth";

interface ArtistProfileProps {
  user: UserProfile;
}

export function ArtistProfile({ user }: ArtistProfileProps) {
  const { user: currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [coverImageError, setCoverImageError] = useState(false);
  
  // Check if viewing own profile
  const isOwnProfile = currentUser?.id === user.id;

  const avatarUrl = getAvatarUrl(user.image, user.name || "Artist", 200);
  const displayUrl = imageError ? getAvatarUrl(null, user.name || "Artist", 200) : avatarUrl;
  const coverImageUrl = user.coverImage || "/default-cover.jpg";

  return (
    <div className="mb-12">
      {/* Cover Image Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
        {/* Cover Image */}
        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
          {!coverImageError && coverImageUrl && coverImageUrl !== "/default-cover.jpg" ? (
            <img
              src={coverImageUrl}
              alt={`${user.name || "Artist"} cover`}
              className="w-full h-full object-cover"
              onError={() => setCoverImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Palette className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>

        {/* Header with Profile Picture and Info */}
        <div className="p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4 -mt-16">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md bg-white">
            <img
              src={displayUrl}
              alt={user.name || "Artist profile"}
                    className="w-full h-full object-cover"
              onError={() => setImageError(true)}
              onLoad={() => setImageError(false)}
            />
          </div>
        </div>

              {/* Name and Details */}
              <div className="mt-12">
                <h1 className="text-3xl font-bold text-gray-900">
              {user.name || "Artist"}
            </h1>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                  {user.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  {user.website && (
                    <a
                      href={user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:text-red-700 transition-colors"
                    >
                      <Globe className="h-4 w-4" />
                      <span className="underline">Website</span>
                    </a>
                  )}
                  {user.artworkCount !== undefined && (
                    <div className="flex items-center gap-1.5">
                      <Palette className="h-4 w-4" />
                      <span>{user.artworkCount} {user.artworkCount === 1 ? "artwork" : "artworks"}</span>
                    </div>
                  )}
                </div>
              </div>
          </div>

          {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-4 lg:mt-0">
            {!isOwnProfile && (
              <FollowButton
                userId={user.id}
                isFollowing={user.isFollowing}
                variant="default"
                className="bg-red-700 hover:bg-red-800 text-white shadow-sm"
              />
            )}
            <Button
              variant="outline"
              size="icon"
                className="border-gray-300 hover:bg-gray-50"
                title="Notifications"
            >
              <Bell className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
                className="border-gray-300 hover:bg-gray-50"
              onClick={() => setIsLiked(!isLiked)}
                title="Like"
            >
              <Heart
                className={`h-4 w-4 ${
                  isLiked ? "fill-current text-red-500" : ""
                }`}
              />
            </Button>
            <Button
              variant="outline"
              size="icon"
                className="border-gray-300 hover:bg-gray-50"
                title="Share"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            </div>
          </div>

          {/* Bio/Introduction */}
          {user.bio && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-gray-700 leading-relaxed text-base">
                {user.bio}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
