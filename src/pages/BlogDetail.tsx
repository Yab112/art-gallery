import { ArtPlaceholder } from "@/components/blog/art-placeholder";
import { NewsBlogCard } from "@/components/blog/news-blog-card";
import { BlogDetailSkeleton } from "@/components/blog/blog-detail-skeleton";
import { ArtVideoPlayer } from "@/components/blog/art-video-player";
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
  Loader2,
  MessageSquare,
  Share2,
  ThumbsDown,
  ThumbsUp,
  User,
  ExternalLink,
  ShoppingBag,
  Star,
  ChevronRight,
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
  const [imgError, setImgError] = useState(false);
  const [authorImgError, setAuthorImgError] = useState(false);
  const [artistImgError, setArtistImgError] = useState(false);
  const [artworkImgErrors, setArtworkImgErrors] = useState<
    Record<string, boolean>
  >({});

  const handleArtworkImgError = (artworkId: string) => {
    setArtworkImgErrors((prev) => ({ ...prev, [artworkId]: true }));
  };

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 border-gray-200 border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-[1600px] px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              className="group flex items-center font-bold text-gray-900 text-xs uppercase tracking-widest transition-colors hover:text-red-700"
              onClick={() => navigate(returnTo, { state: returnState })}
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              {returnTo.includes("/profile") ? "My Blogs" : "Back to News"}
            </button>
            <div className="flex items-center gap-4">
              <span className="font-black text-red-700 text-[10px] uppercase tracking-[0.2em]">
                {blogPost.category?.name || "Art News"}
              </span>
              <div className="h-4 w-px bg-gray-200" />
              <button
                onClick={() => handleShare()}
                className="text-gray-400 hover:text-gray-900"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Main Content Column */}
          <article className="lg:col-span-8">
            {/* News Header */}
            <header className="mb-10">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                {blogPost.isBreaking && (
                  <span className="bg-red-700 px-2 py-1 font-black text-white text-[10px] uppercase tracking-wider">
                    Breaking News
                  </span>
                )}
                {blogPost.badge && (
                  <span className="bg-black px-2 py-1 font-black text-white text-[10px] uppercase tracking-wider">
                    {blogPost.badge}
                  </span>
                )}
                {blogPost.locationTag && (
                  <span className="font-bold text-gray-500 text-[10px] uppercase tracking-widest">
                    {blogPost.locationTag}
                  </span>
                )}
              </div>

              <h1 className="mb-8 font-extrabold text-gray-900 text-3xl leading-[1.1] md:text-5xl lg:text-6xl tracking-tight">
                {blogPost.title}
              </h1>

              {blogPost.subtitle && (
                <p className="mb-10 font-bold text-gray-700 text-2xl md:text-3xl leading-snug">
                  {blogPost.subtitle}
                </p>
              )}

              {/* Author & Meta */}
              <div className="flex flex-col gap-8 border-gray-100 border-y py-10">
                <div className="flex flex-wrap items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    {blogPost.author?.image && !authorImgError ? (
                      <img
                        src={blogPost.author.image}
                        alt={blogPost.author.name}
                        onError={() => setAuthorImgError(true)}
                        className="h-14 w-14 rounded-full object-cover grayscale"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                        <User className="h-7 w-7 text-gray-400" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 text-lg uppercase tracking-tight">
                        By {blogPost.author?.name || "Anonymous"}
                      </span>
                      <div className="flex items-center gap-2 font-bold text-gray-500 text-[10px] uppercase tracking-widest">
                        <span>
                          Updated{" "}
                          {formatDate(
                            blogPost.publishedAt || blogPost.createdAt,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    {blogPost.readingTimeMin && (
                      <div className="flex flex-col items-center border-gray-100 border-r pr-8">
                        <span className="font-black text-gray-900 text-xl">
                          {blogPost.readingTimeMin}
                        </span>
                        <span className="font-black text-gray-400 text-[9px] uppercase tracking-[0.2em]">
                          min read
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col items-center">
                      <span className="font-black text-gray-900 text-xl">
                        {blogPost.views.toLocaleString()}
                      </span>
                      <span className="font-black text-gray-400 text-[9px] uppercase tracking-[0.2em]">
                        views
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Featured Image or Video Player */}
            {blogPost.mediaType === "VIDEO" && blogPost.videoUrl ? (
              <ArtVideoPlayer
                url={blogPost.videoUrl}
                poster={blogPost.featuredImage}
                className="mb-12"
              />
            ) : blogPost.featuredImage && !imgError ? (
              <div className="mb-12 overflow-hidden bg-gray-100">
                <img
                  src={blogPost.featuredImage}
                  alt={blogPost.title}
                  onError={() => setImgError(true)}
                  className="w-full object-cover"
                />
              </div>
            ) : (
              <ArtPlaceholder
                className="mb-12 aspect-video w-full"
                iconSize={64}
                text="The Art Journal"
                type={
                  blogPost.mediaType === "VIDEO"
                    ? blogPost.isBreaking
                      ? "BREAKING_VIDEO"
                      : "VIDEO"
                    : "IMAGE"
                }
              />
            )}

            {/* Content Body */}
            <div
              className="prose prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-gray-800 prose-a:text-red-700 prose-img:rounded-sm"
              dangerouslySetInnerHTML={{
                __html: blogPost.contentHtml || blogPost.content,
              }}
            />

            {/* Tags Section */}
            {blogPost.tags && blogPost.tags.length > 0 && (
              <div className="mt-12 flex flex-wrap gap-2 border-gray-100 border-t pt-8">
                {blogPost.tags.map(({ tag }) => (
                  <Link
                    key={tag.id}
                    to={`/blog?search=${tag.name}`}
                    className="bg-gray-50 px-3 py-1.5 font-bold text-gray-500 text-[10px] uppercase tracking-widest transition-colors hover:bg-gray-100 hover:text-red-700"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* References Section */}
            {blogPost.references && blogPost.references.length > 0 && (
              <div className="mt-12 bg-gray-50 p-8">
                <h3 className="mb-4 font-black text-gray-900 text-xs uppercase tracking-widest">
                  Sources & References
                </h3>
                <ul className="space-y-3">
                  {blogPost.references.map((ref) => (
                    <li key={ref.id}>
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 font-bold text-gray-600 text-sm hover:text-red-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {ref.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Engagement Actions */}
            <div className="mt-12 flex items-center gap-4 border-gray-200 border-t pt-8">
              {user ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant={
                      userVote?.voteType === "LIKE" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handleVote("LIKE")}
                    disabled={voteMutation.isPending}
                    className={`rounded-none font-bold text-[10px] uppercase tracking-widest ${
                      userVote?.voteType === "LIKE"
                        ? "bg-red-700 hover:bg-red-800"
                        : ""
                    }`}
                  >
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Agree ({blogPost.likes})
                  </Button>
                  <Button
                    variant={
                      userVote?.voteType === "DISLIKE" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handleVote("DISLIKE")}
                    disabled={voteMutation.isPending}
                    className={`rounded-none font-bold text-[10px] uppercase tracking-widest ${
                      userVote?.voteType === "DISLIKE"
                        ? "bg-black hover:bg-gray-900 text-white"
                        : ""
                    }`}
                  >
                    <ThumbsDown className="mr-2 h-4 w-4" />
                    Disagree ({blogPost.dislikes})
                  </Button>
                </div>
              ) : (
                <Link
                  to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-none font-bold text-[10px] uppercase tracking-widest"
                  >
                    Sign in to join the conversation
                  </Button>
                </Link>
              )}
            </div>

            {/* Comments Section */}
            <section className="mt-16 border-gray-200 border-t pt-12">
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-gray-900" />
                  <h2 className="font-black text-gray-900 text-xl uppercase tracking-widest">
                    Discussion ({commentsData?.total || 0})
                  </h2>
                </div>
              </div>

              {/* Comment Form */}
              {user ? (
                <form
                  onSubmit={handleSubmit(onSubmitComment)}
                  className="mb-12"
                >
                  <Textarea
                    placeholder="Add your perspective..."
                    className="mb-4 min-h-[120px] rounded-none border-gray-200 focus:border-red-700 focus:ring-red-700"
                    {...register("content", { required: true, minLength: 1 })}
                  />
                  <Button
                    type="submit"
                    disabled={createComment.isPending}
                    className="rounded-none bg-black px-8 font-bold text-white text-xs uppercase tracking-widest transition-all hover:bg-red-700"
                  >
                    {createComment.isPending ? "Posting..." : "Post Comment"}
                  </Button>
                </form>
              ) : (
                <div className="mb-12 border-gray-100 border-2 border-dashed p-8 text-center">
                  <p className="mb-4 font-bold text-gray-500 text-sm uppercase tracking-widest">
                    Log in to share your thoughts
                  </p>
                  <Link
                    to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
                  >
                    <Button
                      size="sm"
                      className="bg-red-700 font-bold uppercase tracking-widest"
                    >
                      Log In
                    </Button>
                  </Link>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-8">
                {isLoadingComments ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-red-700" />
                  </div>
                ) : commentsData && commentsData.data.length > 0 ? (
                  commentsData.data.map((comment) => (
                    <div
                      key={comment.id}
                      className="group border-gray-100 border-b pb-8 last:border-0"
                    >
                      <div className="flex items-start gap-4">
                        {comment.user.image ? (
                          <img
                            src={comment.user.image}
                            alt={comment.user.name}
                            className="h-12 w-12 rounded-full object-cover grayscale"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                            <User className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="font-black text-gray-900 text-xs uppercase tracking-tight">
                              {comment.user.name}
                            </span>
                            <span className="font-bold text-gray-400 text-[10px] uppercase tracking-widest">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-700 leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <p className="font-bold text-gray-400 text-xs uppercase tracking-widest italic">
                      Be the first to comment on this story
                    </p>
                  </div>
                )}
              </div>
            </section>
          </article>

          {/* Sidebar Column */}
          <aside className="lg:col-span-4 lg:border-gray-100 lg:border-l lg:pl-12">
            <div className="sticky top-24 space-y-12">
              {/* Featured Artist Section */}
              {blogPost.featuredArtist && (
                <div className="rounded-sm bg-gray-50 p-6">
                  <h3 className="mb-6 border-black border-l-4 pl-3 font-black text-gray-900 text-xs uppercase tracking-widest">
                    Featured Artist
                  </h3>
                  <div className="flex items-center gap-4 mb-6">
                    {blogPost.featuredArtist.image && !artistImgError ? (
                      <img
                        src={blogPost.featuredArtist.image}
                        alt={blogPost.featuredArtist.name}
                        onError={() => setArtistImgError(true)}
                        className="h-16 w-16 rounded-full object-cover grayscale"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-black text-gray-900 text-sm uppercase tracking-tight">
                        {blogPost.featuredArtist.name}
                      </h4>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-gray-500 text-[10px] uppercase tracking-widest">
                          Top Rated Artist
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/profile/${blogPost.featuredArtist.id}`}
                    className="flex w-full items-center justify-between bg-black px-4 py-3 font-bold text-white text-[10px] uppercase tracking-[0.15em] transition-all hover:bg-red-700"
                  >
                    View Full Profile <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              )}

              {/* Shop the Story Section */}
              {blogPost.relatedArtworks &&
                blogPost.relatedArtworks.length > 0 && (
                  <div>
                    <h3 className="mb-6 border-red-700 border-l-4 pl-3 font-black text-gray-900 text-xs uppercase tracking-widest">
                      Shop the Story
                    </h3>
                    <div className="space-y-6">
                      {blogPost.relatedArtworks.map(({ artwork }) => (
                        <Link
                          key={artwork.id}
                          to={`/artwork/${artwork.id}`}
                          className="group block"
                        >
                          <div className="flex gap-4">
                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden bg-gray-100">
                              {artwork.photos?.[0] &&
                              !artworkImgErrors[artwork.id] ? (
                                <img
                                  src={artwork.photos[0]}
                                  alt={artwork.title}
                                  onError={() =>
                                    handleArtworkImgError(artwork.id)
                                  }
                                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                              ) : (
                                <ArtPlaceholder
                                  className="h-full w-full"
                                  iconSize={24}
                                />
                              )}
                            </div>
                            <div className="flex flex-col justify-center">
                              <h4 className="line-clamp-2 font-bold text-gray-900 text-xs uppercase tracking-tight group-hover:text-red-700">
                                {artwork.title}
                              </h4>
                              <span className="mt-1 font-black text-red-700 text-sm">
                                ${artwork.desiredPrice?.toLocaleString() || "0"}
                              </span>
                              <div className="mt-2 flex items-center gap-1 font-bold text-gray-400 text-[9px] uppercase tracking-widest">
                                <ShoppingBag className="h-3 w-3" />
                                Available for purchase
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

              {/* More from this author */}
              <RelatedBlogsSection
                currentBlogId={blogPost.id}
                authorId={blogPost.authorId}
              />

              {/* Most Read Section */}
              <MostReadSection currentBlogId={blogPost.id} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function MostReadSection({ currentBlogId }: { currentBlogId: string }) {
  const { data: trendingBlogs, isLoading } = useGetBlogPosts({
    published: true,
    limit: 6,
    sortBy: "views",
    sortOrder: "desc",
  });

  const filteredBlogs =
    trendingBlogs?.data
      .filter((blog) => blog.id !== currentBlogId)
      .slice(0, 5) || [];

  if (isLoading) {
    return (
      <div className="pt-8">
        <h3 className="mb-6 border-red-700 border-l-4 pl-3 font-black text-gray-900 text-xs uppercase tracking-widest">
          Most Read Stories
        </h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 w-full animate-pulse bg-gray-50" />
          ))}
        </div>
      </div>
    );
  }

  if (filteredBlogs.length === 0) {
    return null;
  }

  return (
    <div className="pt-8 border-gray-100 border-t">
      <h3 className="mb-6 border-red-700 border-l-4 pl-3 font-bold text-gray-900 text-xs uppercase tracking-widest">
        Most Read Stories
      </h3>
      <div className="divide-y divide-gray-100">
        {filteredBlogs.map((post, index) => (
          <NewsBlogCard
            key={post.id}
            blogPost={post}
            layout="RANKED"
            rank={index + 1}
          />
        ))}
      </div>
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
      .slice(0, 4) || [];

  if (isLoading) {
    return (
      <div>
        <h3 className="mb-6 border-gray-200 border-l-4 pl-3 font-black text-gray-900 text-xs uppercase tracking-widest">
          More from this author
        </h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 w-full animate-pulse bg-gray-50" />
          ))}
        </div>
      </div>
    );
  }

  if (filteredBlogs.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="mb-6 border-gray-200 border-l-4 pl-3 font-bold text-gray-900 text-xs uppercase tracking-widest">
        More from this author
      </h3>
      <div className="space-y-4">
        {filteredBlogs.map((post) => (
          <div key={post.id} className="last:border-0">
            <NewsBlogCard blogPost={post} layout="LINK_ONLY" />
          </div>
        ))}
      </div>
    </div>
  );
}
