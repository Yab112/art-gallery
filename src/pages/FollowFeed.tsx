import { useState } from "react";
import { Link } from "react-router-dom";
import { useGetFeed } from "@/services/feed/useGetFeed";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Loader2, Palette, BookOpen, Eye, Heart, Users } from "lucide-react";
import { ArtworkCard } from "@/components/artwork-card";
import { getAvatarUrl } from "@/utils/avatar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FollowFeedPage() {
  const [page, setPage] = useState(1);
  const [type, setType] = useState<"all" | "artworks" | "blog_posts">("all");
  const limit = 20;

  const { data, isLoading, error } = useGetFeed(page, limit, type);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <EmptyState
            icon={Users}
            title="Error Loading Feed"
            description="Failed to load your feed. Please try again later."
          />
        </div>
      </ProtectedRoute>
    );
  }

  const items = data?.items || [];
  const totalPages = data?.totalPages || 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Feed</h1>
              <p className="text-gray-600 mt-2">
                Latest from users you follow
              </p>
            </div>
            <Select value={type} onValueChange={(v) => {
              setType(v as "all" | "artworks" | "blog_posts");
              setPage(1);
            }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Content</SelectItem>
                <SelectItem value="artworks">Artworks Only</SelectItem>
                <SelectItem value="blog_posts">Blog Posts Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Feed Items */}
          {items.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No Content Yet"
              description="Start following users to see their artworks and blog posts in your feed."
            />
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  {item.type === "artwork" && item.artwork && (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <Link to={`/profile/${item.artwork.user.id}`}>
                          <img
                            src={getAvatarUrl(
                              item.artwork.user.image,
                              item.artwork.user.name,
                              40
                            )}
                            alt={item.artwork.user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        </Link>
                        <div>
                          <Link
                            to={`/profile/${item.artwork.user.id}`}
                            className="font-semibold text-gray-900 hover:text-red-600"
                          >
                            {item.artwork.user.name}
                          </Link>
                          <p className="text-sm text-gray-500">
                            posted an artwork
                          </p>
                        </div>
                      </div>
                      <Link to={`/artwork/${item.artwork.id}`}>
                        <ArtworkCard
                          id={item.artwork.id}
                          image={item.artwork.photos[0] || "/placeholder.svg"}
                          title={item.artwork.title || "Untitled"}
                          artist={item.artwork.artist}
                          price={`$${item.artwork.desiredPrice.toLocaleString()}`}
                          year="N/A"
                          medium="N/A"
                          dimensions="N/A"
                          seller={item.artwork.user.name}
                          status={item.artwork.status as any}
                        />
                      </Link>
                    </div>
                  )}

                  {item.type === "blog_post" && item.blogPost && (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <Link to={`/profile/${item.blogPost.author.id}`}>
                          <img
                            src={getAvatarUrl(
                              item.blogPost.author.image,
                              item.blogPost.author.name,
                              40
                            )}
                            alt={item.blogPost.author.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        </Link>
                        <div>
                          <Link
                            to={`/profile/${item.blogPost.author.id}`}
                            className="font-semibold text-gray-900 hover:text-red-600"
                          >
                            {item.blogPost.author.name}
                          </Link>
                          <p className="text-sm text-gray-500">
                            published a blog post
                          </p>
                        </div>
                      </div>
                      <Link to={`/blog/${item.blogPost.slug}`}>
                        <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          {item.blogPost.featuredImage && (
                            <img
                              src={item.blogPost.featuredImage}
                              alt={item.blogPost.title}
                              className="w-full h-48 object-cover"
                            />
                          )}
                          <div className="p-4">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              {item.blogPost.title}
                            </h3>
                            {item.blogPost.excerpt && (
                              <p className="text-gray-600 mb-4">
                                {item.blogPost.excerpt}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                <span>{item.blogPost.views}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="h-4 w-4" />
                                <span>{item.blogPost.likes}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

