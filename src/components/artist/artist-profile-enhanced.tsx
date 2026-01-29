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
  Mountain,
  Image,
  Tag,
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
import { useFollowing } from "@/queries/followQueries";
import { ArtworkCard } from "@/components/artwork-card";

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
  const isGuest = !currentUser;
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [coverImageError, setCoverImageError] = useState(false);
  // Track failed image URLs to prevent flickering from retry loops
  const [failedImageUrls, setFailedImageUrls] = useState<Set<string>>(new Set());
  // Track if profile image has failed to prevent retry loops
  const [profileImageFailed, setProfileImageFailed] = useState(false);
  // Track if placeholder image has also failed
  const [placeholderImageFailed, setPlaceholderImageFailed] = useState(false);

  // Check if viewing own profile
  const isOwnProfile = currentUser?.id === user.id;

  // Memoize avatar URLs to prevent regeneration on every render
  const avatarUrl = useMemo(() => {
    return getAvatarUrl(user.image, user.name || "Artist", 200);
  }, [user.image, user.name]);

  const displayUrl = useMemo(() => {
    if (profileImageFailed || !user.image) {
      return getAvatarUrl(null, user.name || "Artist", 200);
    }
    return avatarUrl;
  }, [profileImageFailed, user.image, user.name, avatarUrl]);

  const coverImageUrl = user.coverImage || "/default-cover.jpg";

  // Extract art specializations from artworks - memoized to prevent flickering
  const specializations = useMemo(() => {
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
  }, [artworks]);

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

  // Get featured artworks (most liked or recent) - memoized to prevent flickering
  // Create a stable signature from artworks to detect actual changes
  const artworksSignature = useMemo(() => {
    if (!artworks || artworks.length === 0) return '';
    return artworks.map(a => `${a.id}-${a.photos?.[0] || ''}-${a.likeCount || 0}`).join('|');
  }, [artworks]);

  const featuredArtworks = useMemo(() => {
    if (!artworks || artworks.length === 0) return [];

    // Create a stable array by filtering, sorting, and slicing
    const filtered = artworks.filter((art) => art.photos && art.photos.length > 0);
    const sorted = [...filtered].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
    return sorted.slice(0, 3);
  }, [artworksSignature]);

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

  // Fetch following users for avatars display
  const { data: followingData } = useFollowing(user.id, 1, 4);
  const followingUsers = followingData?.users || [];

  return (
    <div className="mb-12 space-y-6">
      {/* Cover Image - Full Width Black Banner */}
      <div className="px-4">
        <div className="relative w-full h-48 bg-black">
          {!coverImageError && user.coverImage ? (
            <img
              src={user.coverImage}
              alt={`${user.name || "Artist"} cover`}
              className="w-full h-full object-cover"
              onError={() => setCoverImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="bg-gray-600 rounded-lg p-4 inline-block">
                  <Mountain className="h-12 w-12 text-gray-300 mx-auto" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Header */}
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 -mt-20 flex-1">
              {/* Profile Picture */}
              <div className="relative flex-shrink-0">
                {user.image && !profileImageFailed ? (
                  <img
                    src={displayUrl}
                    alt={user.name || "Artist profile"}
                    className="w-40 h-40 rounded-full object-cover border-[8px]"
                    style={{ borderColor: '#F9FAFB' }}
                    onError={() => {
                      setProfileImageFailed(true); // Mark as failed, prevent retry
                    }}
                  />
                ) : !placeholderImageFailed ? (
                  <img
                    src={displayUrl}
                    alt={user.name || "Artist profile"}
                    className="w-40 h-40 rounded-full object-cover border-[8px]"
                    style={{ borderColor: '#F9FAFB' }}
                    onError={() => {
                      setPlaceholderImageFailed(true); // Mark placeholder as failed
                    }}
                  />
                ) : (
                  <div className="w-40 h-40 bg-blue-600 rounded-full flex items-center justify-center border-[8px]"
                    style={{ borderColor: '#F9FAFB' }}>
                    <span className="text-4xl font-bold text-white">
                      {(user.name || "A")[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Name and Details */}
              <div className="mt-12 flex-1">
                {/* Name with Status Badges */}
                <div className="flex items-center gap-2 mb-2 flex-wrap mt-4">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {user.name || "Artist"}
                  </h1>
                  {isOnline && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md">
                      <Circle className="h-2.5 w-2.5 fill-green-500" />
                      Online
                    </span>
                  )}
                  {isTrending && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-md">
                      <Flame className="h-2.5 w-2.5 fill-orange-500" />
                      Trending
                    </span>
                  )}
                </div>

                {/* Heat Score and Views */}
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="text-gray-500">Heat Score:</span>
                    <span className="font-semibold text-gray-900">
                      {heatScore.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Views:</span>
                    <span className="font-semibold text-gray-900">
                      {profileViews.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Followers/Following Stats */}
                <div className="flex items-center gap-4 mt-3">
                  <Link
                    to={`/profile/${user.id}/followers`}
                    className="text-gray-900 hover:text-red-600 transition-colors"
                  >
                    <span className="text-lg font-semibold">
                      {followerCount}
                    </span>
                    <span className="text-gray-600 ml-1">Followers</span>
                  </Link>
                  <div className="h-4 w-px bg-gray-300"></div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/profile/${user.id}/following`}
                      className="text-gray-900 hover:text-red-600 transition-colors"
                    >
                      <span className="text-lg font-semibold">
                        {followingCount}
                      </span>
                      <span className="text-gray-600 ml-1">Following</span>
                    </Link>
                    {followingUsers.length > 0 && (
                      <div className="flex items-center -space-x-4 ml-2">
                        {followingUsers.slice(0, 4).map((followingUser, index) => (
                          <Link
                            key={followingUser.id}
                            to={`/profile/${followingUser.id}`}
                            className="relative block flex-shrink-0"
                            style={{ zIndex: 4 - index }}
                          >
                            <img
                              src={getAvatarUrl(followingUser.image, followingUser.name || "User", 40)}
                              alt={followingUser.name || "User"}
                              className="w-8 h-8 min-w-[2rem] min-h-[2rem] rounded-full border-2 border-white object-cover hover:scale-110 transition-transform bg-gray-200"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = getAvatarUrl(null, followingUser.name || "User", 40);
                              }}
                              loading="lazy"
                            />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Location, Website, Verified - Subtle Row */}
                {(user.location || user.website || isEmailVerified || memberSinceFormatted) && (
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500">
                    {user.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    {user.website && (
                      <a
                        href={user.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-red-600 transition-colors"
                      >
                        <Globe className="h-3 w-3" />
                        <span>Website</span>
                      </a>
                    )}
                    {isEmailVerified && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Verified</span>
                      </div>
                    )}
                    {memberSinceFormatted && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Joined {memberSinceFormatted}</span>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
            {!isOwnProfile && (
              <div className="flex flex-wrap gap-2 items-center">
                {isGuest ? (
                  <Link to={`/login?redirect=${encodeURIComponent(`/artist/${user.id}`)}`}>
                    <Button variant="outline" size="sm">
                      Sign in to follow
                    </Button>
                  </Link>
                ) : (
                  <FollowButton
                    userId={user.id}
                    isFollowing={user.isFollowing}
                    variant="default"
                  />
                )}
                {!isGuest && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-gray-300 hover:bg-gray-50"
                    onClick={() => setIsLiked(!isLiked)}
                    title="Like"
                  >
                    <Heart
                      className={`h-4 w-4 ${isLiked ? "fill-current text-red-500" : ""
                        }`}
                    />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  className="border-gray-300 hover:bg-gray-50"
                  title="Share"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Achievement Badges */}
      {(hasSpecializations || primaryTalentType || heatScore > 75 || totalArtworks >= 20 || profileViews > 500 || (memberSince && new Date().getFullYear() - memberSince >= 3)) && (
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-wrap items-center gap-2">
            {primaryTalentType && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md">
                {primaryTalentType.icon && (
                  <span className="text-xs">{primaryTalentType.icon}</span>
                )}
                {primaryTalentType.name}
              </span>
            )}
            {heatScore > 75 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-md">
                <Flame className="h-3 w-3" />
                Hot
              </span>
            )}
            {totalArtworks >= 20 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md">
                <Palette className="h-3 w-3" />
                Prolific
              </span>
            )}
            {profileViews > 500 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-md">
                <Eye className="h-3 w-3" />
                Popular
              </span>
            )}
            {memberSince && new Date().getFullYear() - memberSince >= 3 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md">
                <Award className="h-3 w-3" />
                Veteran
              </span>
            )}
          </div>
        </div>
      )}

      {/* Engagement Metrics Row */}
      {isOnline && (
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Online Status Card */}
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
          </div>
        </div>
      )}

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

      {/* Main Content with Right Sidebar */}
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="md:col-span-2 space-y-6">
            {/* Featured Works */}
            <div className="bg-white rounded-md p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-4 w-4 text-gray-400" />
                <h2 className="text-base font-medium text-gray-700">
                  Featured Works
                </h2>
              </div>
              {featuredArtworks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featuredArtworks.map((artwork) => (
                    <ArtworkCard
                      key={artwork.id}
                      id={artwork.id}
                      image={artwork.photos?.[0] || "/placeholder.svg"}
                      title={artwork.title || "Untitled"}
                      artist={artwork.artist || user.name || "Unknown"}
                      price={`US$${artwork.desiredPrice?.toLocaleString() || "0"}`}
                      year={artwork.yearOfArtwork?.toString()}
                      medium={artwork.technique || artwork.support || "N/A"}
                      dimensions={
                        artwork.dimensions
                          ? `${artwork.dimensions.width} × ${artwork.dimensions.height} in`
                          : "N/A"
                      }
                      seller={artwork.user?.name || user.name || "Unknown"}
                      status={artwork.status}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Image className="h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">No featured artworks yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Techniques */}
            <div className="bg-white rounded-md p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Award className="h-4 w-4 text-gray-400" />
                <h2 className="text-base font-medium text-gray-700">
                  Techniques
                </h2>
              </div>
              {specializations.techniques.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {specializations.techniques.map((technique, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-medium"
                    >
                      {technique}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Award className="h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-xs text-gray-500">No techniques yet</p>
                </div>
              )}
            </div>

            {/* Categories */}
            <div className="bg-white rounded-md p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="h-4 w-4 text-gray-400" />
                <h2 className="text-base font-medium text-gray-700">
                  Categories
                </h2>
              </div>
              {specializations.categories.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {specializations.categories.map((category, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Tag className="h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-xs text-gray-500">No categories yet</p>
                </div>
              )}
            </div>

            {/* Statistics - Minimal Footer Style */}
            <div className="bg-white rounded-md p-6 border border-gray-100">
              <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
                <div className="flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5 text-gray-400" />
                  <span className="font-medium text-gray-900">{totalArtworks}</span>
                  <span className="text-gray-500">Artworks</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FolderOpen className="h-3.5 w-3.5 text-gray-400" />
                  <span className="font-medium text-gray-900">{totalCollections}</span>
                  <span className="text-gray-500">Collections</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-gray-400" />
                  <span className="font-medium text-gray-900">{totalBlogs}</span>
                  <span className="text-gray-500">Blog Posts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
