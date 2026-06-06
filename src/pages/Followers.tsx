import { FollowButton } from "@/components/follow/follow-button"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { useAuth } from "@/hooks/use-auth"
import { useFollowers } from "@/queries/followQueries"
import { getAvatarUrl } from "@/utils/avatar"
import { ArrowLeft, Loader2, Users } from "lucide-react"
import { useState } from "react"
import { Link, useParams } from "react-router-dom"

export default function FollowersPage() {
    const { userId } = useParams<{ userId: string }>()
    const { user: currentUser } = useAuth()
    const [page, setPage] = useState(1)
    const limit = 20

    const { data, isLoading, error } = useFollowers(userId, page, limit)

    const isOwnProfile = currentUser?.id === userId

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex min-h-[400px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            </div>
        )
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
        )
    }

    const followers = data?.users || []
    const totalPages = data?.totalPages || 0

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto max-w-4xl px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <Button variant="ghost" size="sm" className="mb-4" asChild>
                        <Link to={userId ? `/profile/${userId}` : "/"}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Profile
                        </Link>
                    </Button>
                    <h1 className="font-bold text-3xl text-gray-900">Followers</h1>
                    <p className="mt-2 text-gray-600">
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
                            const showFollowBack = isOwnProfile && !follower.isFollowing

                            return (
                                <div
                                    key={follower.id}
                                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                                >
                                    <Link
                                        to={`/profile/${follower.id}`}
                                        className="flex min-w-0 flex-1 items-center space-x-4"
                                    >
                                        <img
                                            src={getAvatarUrl(follower.image, follower.name, 60)}
                                            alt={follower.name}
                                            className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <h3 className="truncate font-semibold text-gray-900 text-lg">
                                                {follower.name}
                                            </h3>
                                            <div className="mt-1 flex items-center gap-4 text-gray-500 text-sm">
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
                            )
                        })}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <PaginationControls
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={setPage}
                                className="mt-6"
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
