import { useParams, Link } from "react-router-dom";
import { useFollowers } from "@/queries/followQueries";
import { FollowButton } from "@/components/follow/follow-button";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Loader2 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { getAvatarUrl } from "@/utils/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

export default function FollowersPage() {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, error } = useFollowers(userId, page, limit);

  const isOwnProfile = currentUser?.id === userId;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon={Users}
          title="Error Loading Followers"
          description="Failed to load followers. Please try again later."
        />
      </div>
    );
  }

  const followers = data?.users || [];
  const totalPages = data?.totalPages || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" className="mb-4" asChild>
            <Link to={userId ? `/profile/${userId}` : "/"}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Followers</h1>
          <p className="text-gray-600 mt-2">
            {data?.total || 0} {data?.total === 1 ? "follower" : "followers"}
          </p>
        </div>

        {/* Followers List */}
        {followers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Followers Yet"
            description="This user doesn't have any followers yet."
          />
        ) : (
          <div className="space-y-4">
            {followers.map((follower) => {
              // Show "Follow Back" if viewing own followers and not following them back
              const showFollowBack = isOwnProfile && !follower.isFollowing;
              
              return (
                <div
                  key={follower.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <Link
                    to={`/profile/${follower.id}`}
                    className="flex items-center space-x-4 flex-1 min-w-0"
                  >
                    <img
                      src={getAvatarUrl(follower.image, follower.name, 60)}
                      alt={follower.name}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {follower.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        {follower.followerCount !== undefined && (
                          <span>
                            {follower.followerCount}{" "}
                            {follower.followerCount === 1
                              ? "follower"
                              : "followers"}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                  {currentUser?.id && currentUser.id !== follower.id ? (
                    <div className="ml-4 flex-shrink-0">
                      <FollowButton
                        userId={follower.id}
                        isFollowing={follower.isFollowing}
                        size="sm"
                        showFollowBack={showFollowBack}
                      />
                    </div>
                  ) : null}
                </div>
              );
            })}

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
  );
}

