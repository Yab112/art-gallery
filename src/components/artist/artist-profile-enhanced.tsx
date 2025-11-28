import { Button } from "@/components/ui/button";
import {
  Bell,
  Heart,
  Share2,
  MapPin,
  Globe,
  Palette,
  Award,
  TrendingUp,
  BookOpen,
  FolderOpen,
  Users,
  Sparkles,
  Flame,
  Eye,
  Circle,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { useState, useMemo } from "react";
import type { UserProfile } from "@/types/user.types";
import type { Artwork } from "@/types/artwork.types";
import { getAvatarUrl } from "@/utils/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FollowButton } from "@/components/follow/follow-button";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "react-router-dom";

interface ArtistProfileEnhancedProps {
  user: UserProfile;
  artworks?: Artwork[];
  collectionsCount?: number;
  blogsCount?: number;
}

export function ArtistProfileEnhanced({
  user,
  artworks = [],
  collectionsCount = 0,
  blogsCount = 0,
}: ArtistProfileEnhancedProps) {
  const { user: currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [coverImageError, setCoverImageError] = useState(false);
  
  // Check if viewing own profile
  const isOwnProfile = currentUser?.id === user.id;

  const avatarUrl = getAvatarUrl(user.image, user.name || "Artist", 200);
  const displayUrl = imageError
    ? getAvatarUrl(null, user.name || "Artist", 200)
    : avatarUrl;
  const coverImageUrl = user.coverImage || "/default-cover.jpg";

  // Extract art specializations from artworks
  const getArtSpecializations = () => {
    const techniques = new Set<string>();
    const categories = new Set<string>();

    artworks.forEach((artwork) => {
      // Use technique if available, otherwise use support as fallback
      const technique = artwork.technique || artwork.support;
      if (technique) {
        techniques.add(technique);
      }
      if (artwork.categories && artwork.categories.length > 0) {
        artwork.categories.forEach((cat) => categories.add(cat.name));
      }
    });

    return {
      techniques: Array.from(techniques).slice(0, 5), // Top 5 techniques
      categories: Array.from(categories).slice(0, 5), // Top 5 categories
    };
  };

  const specializations = getArtSpecializations();
  const hasSpecializations =
    specializations.techniques.length > 0 ||
    specializations.categories.length > 0;

  // Calculate statistics - use user.artworkCount (artworks are fetched via paginated endpoint)
  const totalArtworks = user.artworkCount || 0;
  const totalCollections = collectionsCount || 0;
  const totalBlogs = blogsCount || 0;
  const followerCount = user.followerCount || 0;
  const followingCount = user.followingCount || 0;
  const memberSince = user.createdAt
    ? new Date(user.createdAt).getFullYear()
    : null;
  const profileViews = user.profileViews || 0;
  const heatScore = user.heatScore || 0;

  // Check if user is online (active within last 5 minutes)
  const isOnline = useMemo(() => {
    if (!user.lastActiveAt) return false;
    const lastActive = new Date(user.lastActiveAt);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastActive.getTime()) / (1000 * 60);
    return diffMinutes < 5;
  }, [user.lastActiveAt]);

  // Check if artist is trending (high heat score)
  const isTrending = heatScore > 50; // Threshold for trending

  // Get primary talent type
  const primaryTalentType = user.talentTypes?.[0]?.talentType;

  // Get featured artworks (most liked or recent)
  const featuredArtworks = artworks
    .filter((art) => art.photos && art.photos.length > 0)
    .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
    .slice(0, 3);

  // Calculate heat score percentage for visual indicator (0-100%)
  const heatScorePercentage = Math.min(100, (heatScore / 100) * 100);

  // Format member since date
  const memberSinceDate = user.createdAt ? new Date(user.createdAt) : null;
  const memberSinceFormatted = memberSinceDate
    ? memberSinceDate.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : null;

  // Check if email is verified
  const isEmailVerified = user.emailVerified || false;

  return (
    <div className="mb-12 space-y-6">
      {/* Cover Image Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Cover Image */}
        <div className="relative h-64 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200">
          {!coverImageError &&
          coverImageUrl &&
          coverImageUrl !== "/default-cover.jpg" ? (
            <img
              src={coverImageUrl}
              alt={`${user.name || "Artist"} cover`}
              className="w-full h-full object-cover"
              onError={() => setCoverImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
              <div className="text-center">
                <Palette className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No cover image</p>
              </div>
            </div>
          )}
        </div>

        {/* Header with Profile Picture and Info */}
        <div className="p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-start space-x-4 -mt-20">
              {/* Profile Picture with Trophies */}
              <div className="flex items-center gap-3">
                {/* Profile Picture */}
                <div className="relative flex-shrink-0">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white ring-2 ring-gray-100">
                    <img
                      src={displayUrl}
                      alt={user.name || "Artist profile"}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                      onLoad={() => setImageError(false)}
                    />
                  </div>
                  {/* Online Status Indicator */}
                  {isOnline && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 shadow-md ring-2 ring-white">
                      <Circle className="h-4 w-4 text-white fill-white" />
                    </div>
                  )}
                </div>

                {/* Trophies/Achievements - Horizontal next to avatar */}
              </div>

              {/* Name and Details */}
              <div className="mt-20 flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {user.name || "Artist"}
                  </h1>
                  {isOnline && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-green-50 text-green-700 border-green-200"
                    >
                      <Circle className="h-2 w-2 fill-green-500 mr-1" />
                      Online
                    </Badge>
                  )}
                  {isTrending && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-orange-50 text-orange-700 border-orange-200"
                    >
                      <Flame className="h-3 w-3 mr-1 fill-orange-500" />
                      Trending
                    </Badge>
                  )}
                  {primaryTalentType && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1"
                    >
                      {primaryTalentType.icon && (
                        <span className="text-xs">
                          {primaryTalentType.icon}
                        </span>
                      )}
                      {primaryTalentType.name}
                    </Badge>
                  )}
                  {memberSince && (
                    <Badge
                      variant="outline"
                      className="text-xs inline-flex items-center gap-1.5"
                    >
                      <Award className="h-3 w-3 text-gray-600 flex-shrink-0" />
                      <span>Since {memberSince}</span>
                    </Badge>
                  )}
                </div>
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
                  {isEmailVerified && (
                    <div className="flex items-center gap-1.5 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Verified</span>
                    </div>
                  )}
                  {memberSinceFormatted && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      <span>Member since {memberSinceFormatted}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Specializations Badge - moved from avatar to here */}
                    {hasSpecializations && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-red-100 to-pink-100 rounded-full border border-red-200 shadow-sm">
                        <Sparkles className="h-4 w-4 text-red-600 flex-shrink-0" />
                        <span className="text-xs font-semibold text-red-700">
                          Artist
                        </span>
                      </div>
                    )}
                    {isTrending && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-orange-100 to-red-100 rounded-full border border-orange-200 shadow-sm">
                        <Award className="h-4 w-4 text-orange-600" />
                        <span className="text-xs font-semibold text-orange-700">
                          Trending
                        </span>
                      </div>
                    )}
                    {heatScore > 75 && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-full border border-yellow-200 shadow-sm">
                        <Flame className="h-4 w-4 text-yellow-600 fill-yellow-600" />
                        <span className="text-xs font-semibold text-yellow-700">
                          Hot
                        </span>
                      </div>
                    )}
                    {totalArtworks >= 20 && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full border border-blue-200 shadow-sm">
                        <Palette className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-semibold text-blue-700">
                          Prolific
                        </span>
                      </div>
                    )}
                    {profileViews > 500 && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full border border-purple-200 shadow-sm">
                        <Eye className="h-4 w-4 text-purple-600" />
                        <span className="text-xs font-semibold text-purple-700">
                          Popular
                        </span>
                      </div>
                    )}
                    {isEmailVerified && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full border border-green-200 shadow-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600 fill-green-600" />
                        <span className="text-xs font-semibold text-green-700">
                          Verified
                        </span>
                      </div>
                    )}
                    {memberSince &&
                      new Date().getFullYear() - memberSince >= 3 && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-gray-100 to-slate-100 rounded-full border border-gray-200 shadow-sm">
                          <Award className="h-4 w-4 text-gray-600" />
                          <span className="text-xs font-semibold text-gray-700">
                            Veteran
                          </span>
                        </div>
                      )}
                  </div>
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-center gap-3 p-4">
          <div className="p-2 bg-red-50 rounded-lg">
            <Palette className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{totalArtworks}</p>
            <p className="text-xs text-gray-600">Artworks</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <FolderOpen className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {totalCollections}
            </p>
            <p className="text-xs text-gray-600">Collections</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4">
          <div className="p-2 bg-green-50 rounded-lg">
            <BookOpen className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{totalBlogs}</p>
            <p className="text-xs text-gray-600">Blog Posts</p>
          </div>
        </div>

        <Link
          to={`/profile/${user.id}/followers`}
          className="flex items-center gap-3 p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
        >
          <div className="p-2 bg-purple-50 rounded-lg">
            <Users className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{followerCount}</p>
            <p className="text-xs text-gray-600">Followers</p>
          </div>
        </Link>
      </div>

      {/* Engagement Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Heat Score */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 relative overflow-hidden p-4 rounded-lg">
          {isTrending && (
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200 rounded-full -mr-10 -mt-10 opacity-20" />
          )}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Flame className="h-5 w-5 text-orange-600 fill-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Heat Score
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {heatScore.toFixed(1)}
                    {isTrending && (
                      <span className="ml-2 text-orange-600 text-lg">🔥</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            {/* Heat Score Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 transition-all duration-500 shadow-sm"
                style={{ width: `${heatScorePercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">Engagement ranking</p>
              {isTrending && (
                <span className="text-xs font-semibold text-orange-600">
                  Trending!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Profile Views Card - Only show on own profile, not public */}
        {/* Removed - Profile Views should only be visible on user's own profile page */}

        {/* Online Status Card */}
        {isOnline && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Circle className="h-5 w-5 text-green-600 fill-green-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">Online Now</p>
                <p className="text-xs text-gray-600">Active recently</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Additional Info Section - Only show timezone and language, NOT subscriptions (private info) */}
      {/* {(timezoneDisplay || languageDisplay) && (
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Additional Information
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {timezoneDisplay && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Timezone</p>
                    <p className="text-sm font-medium text-gray-900">
                      {timezoneDisplay}
                    </p>
                  </div>
                </div>
              )}
              {languageDisplay && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Languages className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Language</p>
                    <p className="text-sm font-medium text-gray-900">
                      {languageDisplay}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )} */}

      {/* Art Specializations */}
      {hasSpecializations && (
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-red-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Art Specializations
              </h2>
            </div>
            <div className="space-y-4">
              {specializations.techniques.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Techniques
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {specializations.techniques.map((technique, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                      >
                        {technique}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {specializations.categories.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {specializations.categories.map((category, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Featured Artworks Preview */}
      {featuredArtworks.length > 0 && (
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-red-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Featured Works
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {featuredArtworks.map((artwork, idx) => (
                <div
                  key={artwork.id || idx}
                  className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer hover:scale-105 transition-transform"
                >
                  <img
                    src={artwork.photos?.[0] || "/placeholder.svg"}
                    alt={artwork.title || "Artwork"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-white text-xs font-medium truncate">
                        {artwork.title || "Untitled"}
                      </p>
                      {artwork.likeCount !== undefined &&
                        artwork.likeCount > 0 && (
                          <p className="text-white/80 text-xs">
                            {artwork.likeCount} likes
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
