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
  BarChart3
} from "lucide-react";
import { useState } from "react";
import type { UserProfile } from "@/types/user.types";
import type { Artwork } from "@/types/artwork.types";
import { getAvatarUrl } from "@/utils/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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
  blogsCount = 0
}: ArtistProfileEnhancedProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [coverImageError, setCoverImageError] = useState(false);

  const avatarUrl = getAvatarUrl(user.image, user.name || "Artist", 200);
  const displayUrl = imageError ? getAvatarUrl(null, user.name || "Artist", 200) : avatarUrl;
  const coverImageUrl = user.coverImage || "/default-cover.jpg";

  // Extract art specializations from artworks
  const getArtSpecializations = () => {
    const techniques = new Set<string>();
    const categories = new Set<string>();
    
    artworks.forEach(artwork => {
      // Use technique if available, otherwise use support as fallback
      const technique = artwork.technique || artwork.support;
      if (technique) {
        techniques.add(technique);
      }
      if (artwork.categories && artwork.categories.length > 0) {
        artwork.categories.forEach(cat => categories.add(cat.name));
      }
    });

    return {
      techniques: Array.from(techniques).slice(0, 5), // Top 5 techniques
      categories: Array.from(categories).slice(0, 5), // Top 5 categories
    };
  };

  const specializations = getArtSpecializations();
  const hasSpecializations = specializations.techniques.length > 0 || specializations.categories.length > 0;

  // Calculate statistics
  const totalArtworks = artworks.length || user.artworkCount || 0;
  const totalCollections = collectionsCount || 0;
  const totalBlogs = blogsCount || 0;
  const memberSince = user.createdAt ? new Date(user.createdAt).getFullYear() : null;

  // Get featured artworks (most liked or recent)
  const featuredArtworks = artworks
    .filter(art => art.photos && art.photos.length > 0)
    .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
    .slice(0, 3);

  return (
    <div className="mb-12 space-y-6">
      {/* Cover Image Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Cover Image */}
        <div className="relative h-64 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200">
          {!coverImageError && coverImageUrl && coverImageUrl !== "/default-cover.jpg" ? (
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
            <div className="flex items-center space-x-4 -mt-20">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white ring-2 ring-gray-100">
                  <img
                    src={displayUrl}
                    alt={user.name || "Artist profile"}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                    onLoad={() => setImageError(false)}
                  />
                </div>
                {hasSpecializations && (
                  <div className="absolute -bottom-1 -right-1 bg-red-600 rounded-full p-1.5 shadow-md">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>

              {/* Name and Details */}
              <div className="mt-20">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {user.name || "Artist"}
                  </h1>
                  {memberSince && (
                    <Badge variant="outline" className="text-xs">
                      Since {memberSince}
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
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-4 lg:mt-0">
              <Button
                variant="default"
                size="default"
                className="bg-red-700 hover:bg-red-800 text-white shadow-sm"
                onClick={() => setIsFollowing(!isFollowing)}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-gray-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <Palette className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalArtworks}</p>
                <p className="text-xs text-gray-600">Artworks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FolderOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalCollections}</p>
                <p className="text-xs text-gray-600">Collections</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalBlogs}</p>
                <p className="text-xs text-gray-600">Blog Posts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-xs text-gray-600">Followers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Art Specializations */}
      {hasSpecializations && (
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-red-600" />
              <h2 className="text-lg font-semibold text-gray-900">Art Specializations</h2>
            </div>
            <div className="space-y-4">
              {specializations.techniques.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Techniques</p>
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
                  <p className="text-sm font-medium text-gray-700 mb-2">Categories</p>
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
                <h2 className="text-lg font-semibold text-gray-900">Featured Works</h2>
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
                      {artwork.likeCount !== undefined && artwork.likeCount > 0 && (
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

