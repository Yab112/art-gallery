import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import {
  useGetBlogPost,
  useGetBlogComments,
  useCreateBlogComment,
  useVoteBlogPost,
  useGetUserVote,
  useShareBlogPost,
  useGetBlogPosts,
  usePublishBlogPost,
} from "@/services/blog";
import { useAuth } from "@/hooks/use-auth";
import {
  Loader2,
  Calendar,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Share2,
  User,
  ArrowLeft,
  MessageSquare,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BlogCard } from "@/components/blog/blog-card";
import { BlogDetailSkeleton } from "@/components/blog/blog-detail-skeleton";
import { BlogCardSkeleton } from "@/components/blog/blog-card-skeleton";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
      }
    );
  };

  if (isLoading) {
    return <BlogDetailSkeleton />;
  }

  if (error || !blogPost) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Blog Post Not Found
          </h2>
          <p className="text-gray-600 mb-4">
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
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
            onClick={() => navigate(returnTo, { state: returnState })}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {returnTo === "/blog/my-blogs"
              ? "Back to My Blogs"
              : "Back to Blog"}
          </Button>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Image */}
        {blogPost.featuredImage && (
          <div className="mb-8 rounded-lg overflow-hidden shadow-xl">
            <img
              src={blogPost.featuredImage}
              alt={blogPost.title}
              className="w-full h-[400px] object-cover"
            />
          </div>
        )}

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {blogPost.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              {blogPost.author?.image ? (
                <img
                  src={blogPost.author.image}
                  alt={blogPost.author.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
              )}
              <span className="font-medium text-gray-800">
                {blogPost.author?.name || "Anonymous"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>
                {formatDate(blogPost.publishedAt || blogPost.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{blogPost.views.toLocaleString()} views</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            {user ? (
              <>
                <Button
                  variant={userVote?.voteType === "LIKE" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleVote("LIKE")}
                  disabled={voteMutation.isPending}
                  className={
                    userVote?.voteType === "LIKE"
                      ? "bg-red-700 hover:bg-red-800"
                      : ""
                  }
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  {blogPost.likes}
                </Button>
                <Button
                  variant={userVote?.voteType === "DISLIKE" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleVote("DISLIKE")}
                  disabled={voteMutation.isPending}
                  className={
                    userVote?.voteType === "DISLIKE"
                      ? "bg-red-700 hover:bg-red-800"
                      : ""
                  }
                >
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  {blogPost.dislikes}
                </Button>
              </>
            ) : (
              <Link to={`/login?redirect=${encodeURIComponent(location.pathname)}`}>
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
              <Share2 className="w-4 h-4 mr-2" />
              Share ({blogPost.shares})
            </Button>

            {user?.id === blogPost.authorId && (
              <span
                className={
                  blogPost.status !== "APPROVED" || blogPost.published
                    ? "cursor-not-allowed inline-block"
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
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : blogPost.published
                        ? "bg-gray-100 text-gray-500 border-gray-200 opacity-60"
                        : ""
                  }
                >
                  {publishMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : blogPost.published ? (
                    "Published"
                  ) : (
                    <>
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Publish
                    </>
                  )}
                </Button>
              </span>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12 mb-12">
          <div
            className="blog-content"
            style={{
              fontSize: "1.125rem",
              lineHeight: "1.75rem",
            }}
            dangerouslySetInnerHTML={{ __html: blogPost.content }}
          />
        </div>

        {/* Comments Section */}
        <section className="mt-16 border-t border-gray-200 pt-12">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="w-6 h-6 text-gray-700" />
            <h2 className="text-2xl font-bold text-gray-900">
              Comments ({commentsData?.total || 0})
            </h2>
          </div>

          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleSubmit(onSubmitComment)} className="mb-8">
              <Textarea
                placeholder="Write a comment..."
                className="min-h-[100px] mb-3"
                {...register("content", {
                  required: "Comment is required",
                  minLength: 1,
                })}
              />
              {errors.content && (
                <p className="text-sm text-red-500 mb-2">
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
            <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-600 mb-2">Sign in to comment</p>
              <Link to={`/login?redirect=${encodeURIComponent(location.pathname)}`}>
                <Button size="sm" className="bg-red-700 hover:bg-red-800">
                  Sign in
                </Button>
              </Link>
            </div>
          )}

          {/* Comments List */}
          {isLoadingComments ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-red-700" />
            </div>
          ) : commentsData && commentsData.data.length > 0 ? (
            <div className="space-y-6">
              {commentsData.data.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-white rounded-lg p-6 border border-gray-200"
                >
                  <div className="flex items-start gap-4">
                    {comment.user.image ? (
                      <img
                        src={comment.user.image}
                        alt={comment.user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">
                          {comment.user.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                      {comment._count && comment._count.replies > 0 && (
                        <p className="text-sm text-gray-500 mt-2">
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
            <div className="text-center py-8 text-gray-500">
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
      <section className="mt-16 border-t border-gray-200 pt-12">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="w-6 h-6 text-gray-700" />
          <h2 className="text-2xl font-bold text-gray-900">
            More from This Author
          </h2>
        </div>
        <div className="space-y-0 bg-white rounded-lg border border-gray-200 overflow-hidden">
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
    <section className="mt-16 border-t border-gray-200 pt-12">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="w-6 h-6 text-gray-700" />
        <h2 className="text-2xl font-bold text-gray-900">
          More from This Author
        </h2>
      </div>
      <div className="space-y-0 bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredBlogs.map((post) => (
          <BlogCard key={post.id} blogPost={post} />
        ))}
      </div>
    </section>
  );
}
