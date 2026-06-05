import { BlogCard } from "@/components/blog/blog-card";
import { BlogCardSkeleton } from "@/components/blog/blog-card-skeleton";
import { BlogDetailSkeleton } from "@/components/blog/blog-detail-skeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import {
  useCreateBlogComment,
  useGetBlogComments,
  useGetBlogPost,
  useGetBlogPosts,
  useGetUserVote,
  usePublishBlogPost,
  useShareBlogPost,
  useVoteBlogPost,
} from "@/services/blog";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Eye,
  Loader2,
  MessageSquare,
  Share2,
  ThumbsDown,
  ThumbsUp,
  User,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

interface CommentFormData {
  content: string;
}

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [commentPage] = useState(1);

  // Get return path from location state
  const returnTo = (location.state as any)?.returnTo || "/blog";
  const returnState = (location.state as any)?.returnState;

  // Fetch blog post
  const { data: blogPost, isLoading, error } = useGetBlogPost(slug || "", true);

  // Fetch comments
  const { data: commentsData, isLoading: isLoadingComments } =
    useGetBlogComments(blogPost?.id || "", commentPage, 20);

  // Fetch user vote only when logged in (guests skip)
  const { data: userVote } = useGetUserVote(blogPost?.id || "", {
    enabled: !!user,
  });

  // Mutations
  const createComment = useCreateBlogComment(blogPost?.id || "");
  const voteMutation = useVoteBlogPost(blogPost?.id || "");
  const shareMutation = useShareBlogPost(blogPost?.id || "");
  const publishMutation = usePublishBlogPost();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormData>();

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleVote = (type: "LIKE" | "DISLIKE") => {
    if (!user) {
      // Redirect to login or show message
      return;
    }
    voteMutation.mutate({ type });
  };

  const handleShare = (platform?: string) => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
    if (user) {
      shareMutation.mutate({ platform });
    }
  };

  const handlePublish = async () => {
    if (!blogPost) return;
    try {
      await publishMutation.mutateAsync(blogPost.id);
      toast.success("Blog post published successfully!");
    } catch (error) {
      console.error("Failed to publish blog post:", error);
      toast.error("Failed to publish blog post. Please try again.");
    }
  };

  const onSubmitComment = (data: CommentFormData) => {
    if (!user) {
      toast.error("Please login to comment");
      return;
    }
    createComment.mutate(
      { content: data.content },
      {
        onSuccess: () => {
          reset();
        },
      },
    );
  };

  if (isLoading) {
    return <BlogDetailSkeleton />;
  }

  if (error || !blogPost) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 font-bold text-2xl text-gray-900">
            Blog Post Not Found
          </h2>
          <p className="mb-4 text-gray-600">
            The blog post you're looking for doesn't exist.
          </p>
          <Link to="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 border-gray-200 border-b bg-white">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
            onClick={() => navigate(returnTo, { state: returnState })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {returnTo === "/blog/my-blogs"
              ? "Back to My Blogs"
              : "Back to Blog"}
          </Button>
        </div>
      </div>

      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Featured Image */}
        {blogPost.featuredImage && (
          <div className="mb-8 overflow-hidden rounded-lg shadow-xl">
            <img
              src={blogPost.featuredImage}
              alt={blogPost.title}
              className="h-[400px] w-full object-cover"
            />
          </div>
        )}

        {/* Header */}
        <header className="mb-8">
          <h1 className="mb-4 font-bold text-4xl text-gray-900 leading-tight md:text-5xl">
            {blogPost.title}
          </h1>

          {/* Meta Info */}
          <div className="mb-6 flex flex-wrap items-center gap-4 text-gray-600 text-sm">
            <div className="flex items-center gap-2">
              {blogPost.author?.image ? (
                <img
                  src={blogPost.author.image}
                  alt={blogPost.author.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
              )}
              <span className="font-medium text-gray-800">
                {blogPost.author?.name || "Anonymous"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDate(blogPost.publishedAt || blogPost.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{blogPost.views.toLocaleString()} views</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 border-gray-200 border-t pt-4">
            {user ? (
              <>
                <Button
                  variant={
                    userVote?.voteType === "LIKE" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleVote("LIKE")}
                  disabled={voteMutation.isPending}
                  className={
                    userVote?.voteType === "LIKE"
                      ? "bg-red-700 hover:bg-red-800"
                      : ""
                  }
                >
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  {blogPost.likes}
                </Button>
                <Button
                  variant={
                    userVote?.voteType === "DISLIKE" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleVote("DISLIKE")}
                  disabled={voteMutation.isPending}
                  className={
                    userVote?.voteType === "DISLIKE"
                      ? "bg-red-700 hover:bg-red-800"
                      : ""
                  }
                >
                  <ThumbsDown className="mr-2 h-4 w-4" />
                  {blogPost.dislikes}
                </Button>
              </>
            ) : (
              <Link
                to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
              >
                <Button variant="outline" size="sm">
                  Sign in to vote
                </Button>
              </Link>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare()}
              disabled={shareMutation.isPending}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share ({blogPost.shares})
            </Button>

            {user?.id === blogPost.authorId && (
              <span
                className={
                  blogPost.status !== "APPROVED" || blogPost.published
                    ? "inline-block cursor-not-allowed"
                    : "inline-block"
                }
                title={
                  blogPost.published
                    ? "Blog is live"
                    : blogPost.status === "PENDING"
                      ? "Waiting for admin approval"
                      : blogPost.status === "REJECTED"
                        ? "This blog was rejected"
                        : "Publish your blog"
                }
              >
                <Button
                  variant={blogPost.published ? "secondary" : "default"}
                  size="sm"
                  onClick={() => !blogPost.published && handlePublish()}
                  disabled={
                    blogPost.status !== "APPROVED" ||
                    blogPost.published ||
                    publishMutation.isPending
                  }
                  className={
                    !blogPost.published && blogPost.status === "APPROVED"
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : blogPost.published
                        ? "border-gray-200 bg-gray-100 text-gray-500 opacity-60"
                        : ""
                  }
                >
                  {publishMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : blogPost.published ? (
                    "Published"
                  ) : (
                    <>
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Publish
                    </>
                  )}
                </Button>
              </span>
            )}
          </div>
        </header>

        <div className="mb-12 border-gray-100 border-y py-12">
          <div
            className="blog-content mx-auto max-w-3xl"
            style={{
              fontSize: "1.125rem",
              lineHeight: "1.85rem",
            }}
            dangerouslySetInnerHTML={{ __html: blogPost.content }}
          />
        </div>

        {/* Comments Section */}
        <section className="mt-16 border-gray-200 border-t pt-12">
          <div className="mb-6 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-gray-700" />
            <h2 className="font-bold text-2xl text-gray-900">
              Comments ({commentsData?.total || 0})
            </h2>
          </div>

          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleSubmit(onSubmitComment)} className="mb-8">
              <Textarea
                placeholder="Write a comment..."
                className="mb-3 min-h-[100px]"
                {...register("content", {
                  required: "Comment is required",
                  minLength: 1,
                })}
              />
              {errors.content && (
                <p className="mb-2 text-red-500 text-sm">
                  {errors.content.message}
                </p>
              )}
              <Button
                type="submit"
                disabled={createComment.isPending}
                className="bg-red-700 hover:bg-red-800"
              >
                {createComment.isPending ? "Posting..." : "Post Comment"}
              </Button>
            </form>
          ) : (
            <div className="mb-8 rounded-lg bg-gray-50 p-4 text-center">
              <p className="mb-2 text-gray-600">Sign in to comment</p>
              <Link
                to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
              >
                <Button size="sm" className="bg-red-700 hover:bg-red-800">
                  Sign in
                </Button>
              </Link>
            </div>
          )}

          {/* Comments List */}
          {isLoadingComments ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-red-700" />
            </div>
          ) : commentsData && commentsData.data.length > 0 ? (
            <div className="space-y-6">
              {commentsData.data.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-lg border border-gray-200 bg-white p-6"
                >
                  <div className="flex items-start gap-4">
                    {comment.user.image ? (
                      <img
                        src={comment.user.image}
                        alt={comment.user.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {comment.user.name}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-gray-700">
                        {comment.content}
                      </p>
                      {comment._count && comment._count.replies > 0 && (
                        <p className="mt-2 text-gray-500 text-sm">
                          {comment._count.replies}{" "}
                          {comment._count.replies === 1 ? "reply" : "replies"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              No comments yet. Be the first to comment!
            </div>
          )}
        </section>

        {/* Related Blogs Section */}
        <RelatedBlogsSection
          currentBlogId={blogPost.id}
          authorId={blogPost.authorId}
        />
      </article>
    </div>
  );
}

function RelatedBlogsSection({
  currentBlogId,
  authorId,
}: {
  currentBlogId: string;
  authorId: string;
}) {
  const { data: relatedBlogs, isLoading } = useGetBlogPosts({
    authorId: authorId,
    published: true,
    limit: 6,
    sortBy: "publishedAt",
    sortOrder: "desc",
  });

  // Filter out current blog and get up to 5 related blogs
  const filteredBlogs =
    relatedBlogs?.data
      .filter((blog) => blog.id !== currentBlogId)
      .slice(0, 5) || [];

  if (isLoading) {
    return (
      <section className="mt-16 border-gray-200 border-t pt-12">
        <div className="mb-6 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-gray-700" />
          <h2 className="font-bold text-2xl text-gray-900">
            More from This Author
          </h2>
        </div>
        <div className="space-y-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
          {[...Array(3)].map((_, i) => (
            <BlogCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (filteredBlogs.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 border-gray-200 border-t pt-12">
      <div className="mb-8 flex items-center gap-2">
        <BookOpen className="h-6 w-6 text-gray-700" />
        <h2 className="font-bold text-2xl text-gray-900">
          More from This Author
        </h2>
      </div>
      <div className="divide-y divide-gray-100 border-gray-200 border-t">
        {filteredBlogs.map((post) => (
          <BlogCard key={post.id} blogPost={post} />
        ))}
      </div>
    </section>
  );
}
