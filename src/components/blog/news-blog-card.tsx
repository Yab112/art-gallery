import type { BlogPost } from "@/types/blog.types";
import { Link } from "react-router-dom";
import { Play, Video } from "lucide-react";
import { useState } from "react";
import { ArtVideoPlayer } from "./art-video-player";

export type BlogPostLayout =
  | "HERO"
  | "STANDARD"
  | "COMPACT"
  | "LINK_ONLY"
  | "SIDEBAR"
  | "RANKED"
  | "TEXT_ONLY"
  | "OVERLAY";

import { ArtPlaceholder } from "./art-placeholder";

interface NewsBlogCardProps {
  blogPost: BlogPost;
  layout?: BlogPostLayout;
  rank?: number;
  showStatus?: boolean;
}

export function NewsBlogCard({
  blogPost,
  layout = "STANDARD",
  rank,
  showStatus = false,
}: NewsBlogCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [imgError, setImgError] = useState(false);
  const isHero = layout === "HERO";
  const isCompact = layout === "COMPACT";
  const isLinkOnly = layout === "LINK_ONLY";
  const isSidebar = layout === "SIDEBAR";
  const isTextOnly = layout === "TEXT_ONLY";
  const isOverlay = layout === "OVERLAY";

  const categoryName =
    blogPost.category?.name || blogPost.topic?.name || "Art News";

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getEmbedUrl = (url?: string) => {
    if (!url) return "";
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const id = url.includes("v=")
        ? url.split("v=")[1].split("&")[0]
        : url.split("/").pop();
      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=0&controls=1`;
    }
    if (url.includes("vimeo.com")) {
      const id = url.split("/").pop();
      return `https://player.vimeo.com/video/${id}?autoplay=1`;
    }
    return url;
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    if (blogPost.mediaType === "VIDEO" && blogPost.videoUrl) {
      e.preventDefault();
      e.stopPropagation();
      setIsPlaying(true);
    }
  };

  const VideoPlayer = ({
    hideControls = false,
  }: {
    hideControls?: boolean;
  }) => (
    <ArtVideoPlayer
      url={blogPost.videoUrl!}
      poster={blogPost.featuredImage}
      autoPlay
      hideControls={hideControls}
    />
  );

  if (isLinkOnly) {
    return (
      <Link
        to={`/blog/${blogPost.slug}`}
        className="group block border-gray-100 border-b py-3"
      >
        <div className="flex items-start gap-3">
          <h4 className="font-bold text-gray-900 text-sm leading-snug transition-colors group-hover:text-red-700">
            {blogPost.title}
            {blogPost.mediaType === "VIDEO" && (
              <Play className="ml-2 inline-block h-3 w-3 fill-current" />
            )}
          </h4>
        </div>
      </Link>
    );
  }

  if (isOverlay) {
    return (
      <div className="group relative block h-[450px] w-full overflow-hidden bg-gray-900">
        {isPlaying ? (
          <VideoPlayer />
        ) : (
          <Link to={`/blog/${blogPost.slug}`}>
            {blogPost.featuredImage && !imgError ? (
              <img
                src={blogPost.featuredImage}
                alt={blogPost.title}
                onError={() => setImgError(true)}
                className="h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-70"
              />
            ) : blogPost.mediaType === "VIDEO" && blogPost.videoUrl ? (
              <VideoPlayer />
            ) : (
              <ArtPlaceholder
                className="h-full w-full"
                iconSize={48}
                type={
                  blogPost.mediaType === "VIDEO"
                    ? blogPost.isBreaking
                      ? "BREAKING_VIDEO"
                      : "VIDEO"
                    : "IMAGE"
                }
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8">
              <div className="mb-3 flex items-center gap-3">
                <span className="block font-black text-red-500 text-[11px] uppercase tracking-[0.2em]">
                  {blogPost.badge || categoryName}
                </span>
                {blogPost.locationTag && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-white/30" />
                    <span className="font-bold text-white/50 text-[10px] uppercase tracking-widest">
                      {blogPost.locationTag}
                    </span>
                  </>
                )}
              </div>
              <h3 className="mb-4 font-black text-white text-3xl leading-tight transition-colors group-hover:text-red-400 md:text-4xl">
                {blogPost.title}
              </h3>
              <div className="flex items-center gap-4 font-bold text-gray-400 text-[10px] uppercase tracking-widest">
                <span>{blogPost.author?.name}</span>
                <span className="h-1 w-1 rounded-full bg-gray-600" />
                <span>
                  {formatTimeAgo(blogPost.publishedAt || blogPost.createdAt)}
                </span>
              </div>
            </div>
            {blogPost.mediaType === "VIDEO" &&
              blogPost.featuredImage &&
              !imgError && (
                <button
                  onClick={handlePlayClick}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-red-700/90 p-5 text-white transition-transform hover:scale-110"
                >
                  <Play className="h-8 w-8 fill-current" />
                </button>
              )}
          </Link>
        )}
      </div>
    );
  }

  if (isTextOnly) {
    return (
      <Link
        to={`/blog/${blogPost.slug}`}
        className="group block border-gray-100 border-b py-5"
      >
        <div className="flex flex-col gap-2">
          <h4 className="font-black text-gray-900 text-lg leading-snug transition-colors group-hover:text-red-700">
            {blogPost.title}
          </h4>
          <div className="flex items-center gap-3 font-bold text-gray-400 text-[10px] uppercase tracking-widest">
            <span className="text-red-700">{categoryName}</span>
            <span className="h-1 w-1 rounded-full bg-gray-300" />
            <span>
              {formatTimeAgo(blogPost.publishedAt || blogPost.createdAt)}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  if (layout === "RANKED") {
    return (
      <Link
        to={`/blog/${blogPost.slug}`}
        className="group flex items-start gap-4 py-4"
      >
        <span className="font-serif font-medium text-gray-200 text-3xl leading-none transition-colors group-hover:text-red-700/20">
          {rank}
        </span>
        <div className="flex flex-col gap-1">
          <h4 className="line-clamp-2 font-bold text-gray-900 text-sm leading-tight transition-colors group-hover:text-red-700">
            {blogPost.title}
          </h4>
          <span className="font-medium text-gray-400 text-[10px] uppercase tracking-widest">
            {blogPost.author?.name}
          </span>
        </div>
      </Link>
    );
  }

  if (isSidebar) {
    return (
      <Link to={`/blog/${blogPost.slug}`} className="group block py-4">
        <div className="flex gap-4">
          <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden bg-gray-100">
            {isPlaying ? (
              <VideoPlayer />
            ) : (
              <>
                {blogPost.featuredImage && !imgError ? (
                  <img
                    src={blogPost.featuredImage}
                    alt={blogPost.title}
                    onError={() => setImgError(true)}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : blogPost.mediaType === "VIDEO" && blogPost.videoUrl ? (
                  <VideoPlayer />
                ) : (
                  <ArtPlaceholder
                    className="h-full w-full"
                    iconSize={24}
                    type={
                      blogPost.mediaType === "VIDEO"
                        ? blogPost.isBreaking
                          ? "BREAKING_VIDEO"
                          : "VIDEO"
                        : "IMAGE"
                    }
                  />
                )}
                {blogPost.mediaType === "VIDEO" &&
                  blogPost.featuredImage &&
                  !imgError && (
                    <button
                      onClick={handlePlayClick}
                      className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors"
                    >
                      <Play className="h-5 w-5 fill-white text-white" />
                    </button>
                  )}
                {blogPost.mediaType === "VIDEO" && !isPlaying && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-sm bg-black/80 px-2 py-1 font-black text-white text-[9px] uppercase tracking-wider">
                    {blogPost.videoDuration || "Video"}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex flex-col justify-center">
            {blogPost.mediaType === "VIDEO" && (
              <div className="mb-1 flex items-center gap-1.5">
                <Video className="h-2.5 w-2.5 text-red-700" />
                <span className="font-black text-red-700 text-[8px] uppercase tracking-widest">
                  Video
                </span>
              </div>
            )}
            <h4 className="line-clamp-3 font-black text-gray-900 text-[13px] leading-tight transition-colors group-hover:text-red-700">
              {blogPost.title}
            </h4>
            <span className="mt-1 font-bold text-gray-400 text-[9px] uppercase tracking-widest">
              {formatTimeAgo(blogPost.publishedAt || blogPost.createdAt)}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  if (isCompact) {
    return (
      <Link
        to={`/blog/${blogPost.slug}`}
        onMouseEnter={() =>
          blogPost.mediaType === "VIDEO" && setIsPlaying(true)
        }
        onMouseLeave={() =>
          blogPost.mediaType === "VIDEO" && setIsPlaying(false)
        }
        className="group block border-gray-100 border-b py-6"
      >
        <div className="flex flex-col gap-4">
          <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
            {isPlaying && blogPost.mediaType === "VIDEO" ? (
              <VideoPlayer hideControls />
            ) : (
              <>
                {blogPost.featuredImage && !imgError ? (
                  <img
                    src={blogPost.featuredImage}
                    alt={blogPost.title}
                    onError={() => setImgError(true)}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : blogPost.mediaType === "VIDEO" && blogPost.videoUrl ? (
                  <div className="h-full w-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <VideoPlayer hideControls />
                  </div>
                ) : (
                  <ArtPlaceholder
                    className="h-full w-full"
                    iconSize={32}
                    type={
                      blogPost.mediaType === "VIDEO"
                        ? blogPost.isBreaking
                          ? "BREAKING_VIDEO"
                          : "VIDEO"
                        : "IMAGE"
                    }
                  />
                )}
                {blogPost.mediaType === "VIDEO" && !isPlaying && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-sm bg-black/80 px-2 py-1 font-black text-white text-[9px] uppercase tracking-wider">
                    {blogPost.videoDuration || "Video"}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex flex-col">
            {blogPost.mediaType === "VIDEO" && (
              <div className="mb-2 flex items-center gap-2">
                <Video className="h-3 w-3 text-red-700" />
                <span className="font-black text-red-700 text-[9px] uppercase tracking-widest">
                  Video Story
                </span>
              </div>
            )}
            <h4 className="line-clamp-2 font-black text-gray-900 text-sm leading-tight transition-colors group-hover:text-red-700">
              {blogPost.excerpt || blogPost.title}
            </h4>
          </div>
        </div>
      </Link>
    );
  }

  if (isHero) {
    return (
      <article className="flex flex-col">
        <div className="mb-4 flex items-center gap-3">
          <span className="font-black text-red-700 text-[11px] uppercase tracking-[0.2em]">
            {blogPost.badge || categoryName}
          </span>
          {blogPost.locationTag && (
            <>
              <span className="h-1 w-1 rounded-full bg-gray-300" />
              <span className="font-bold text-gray-500 text-[10px] uppercase tracking-widest">
                {blogPost.locationTag}
              </span>
            </>
          )}
          {blogPost.isLive && (
            <span className="flex items-center gap-1.5 bg-red-700 px-2 py-0.5 font-black text-white text-[9px] uppercase tracking-widest animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              Live
            </span>
          )}
        </div>

        <Link to={`/blog/${blogPost.slug}`} className="group block">
          <h2 className="mb-6 font-extrabold text-gray-900 text-3xl leading-[1.1] tracking-tight transition-colors group-hover:text-red-700 md:text-5xl lg:text-6xl">
            {blogPost.title}
          </h2>
        </Link>

        <div className="relative mb-8 aspect-[16/9] overflow-hidden bg-gray-100">
          {isPlaying ? (
            <VideoPlayer />
          ) : (
            <div
              className="group relative h-full w-full cursor-pointer"
              onClick={handlePlayClick}
            >
              {blogPost.featuredImage && !imgError ? (
                <img
                  src={blogPost.featuredImage}
                  alt={blogPost.title}
                  onError={() => setImgError(true)}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : blogPost.mediaType === "VIDEO" && blogPost.videoUrl ? (
                <VideoPlayer />
              ) : (
                <ArtPlaceholder
                  className="h-full w-full"
                  iconSize={48}
                  type={
                    blogPost.mediaType === "VIDEO"
                      ? blogPost.isBreaking
                        ? "BREAKING_VIDEO"
                        : "VIDEO"
                      : "IMAGE"
                  }
                />
              )}
              {blogPost.isBreaking && (
                <div className="absolute top-0 left-0 bg-red-700 px-4 py-2 font-black text-white text-sm uppercase tracking-widest">
                  EXCLUSIVE
                </div>
              )}
              {blogPost.mediaType === "VIDEO" &&
                blogPost.featuredImage &&
                !imgError && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full bg-black/40 p-6 backdrop-blur-sm transition-all hover:bg-red-700/80 hover:scale-110">
                      <Play className="h-12 w-12 fill-white text-white" />
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <div className="md:col-span-8">
            <Link to={`/blog/${blogPost.slug}`} className="group block">
              {blogPost.subtitle ? (
                <p className="font-bold text-gray-800 text-2xl leading-tight transition-colors group-hover:text-red-700 md:text-3xl">
                  {blogPost.subtitle}
                </p>
              ) : blogPost.excerpt ? (
                <p className="line-clamp-3 text-gray-700 text-xl leading-relaxed transition-colors group-hover:text-red-700">
                  {blogPost.excerpt}
                </p>
              ) : null}
            </Link>
          </div>
          <div className="flex flex-col justify-end border-gray-100 border-t pt-6 md:col-span-4 md:border-l md:border-t-0 md:pl-8 md:pt-0">
            <div className="flex flex-col gap-2">
              <span className="font-black text-gray-900 text-xs uppercase tracking-tight">
                By {blogPost.author?.name}
              </span>
              <div className="flex items-center gap-3 font-bold text-gray-400 text-[10px] uppercase tracking-widest">
                <span>
                  {formatTimeAgo(blogPost.publishedAt || blogPost.createdAt)}
                </span>
                {blogPost.readingTimeMin && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-gray-300" />
                    <span>{blogPost.readingTimeMin} min read</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <Link to={`/blog/${blogPost.slug}`} className="group block">
      <article className="flex flex-col gap-5">
        <div className="relative aspect-video overflow-hidden bg-gray-100">
          {isPlaying ? (
            <VideoPlayer />
          ) : (
            <>
              {blogPost.featuredImage && !imgError ? (
                <img
                  src={blogPost.featuredImage}
                  alt={blogPost.title}
                  onError={() => setImgError(true)}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : blogPost.mediaType === "VIDEO" && blogPost.videoUrl ? (
                <VideoPlayer />
              ) : (
                <ArtPlaceholder
                  className="h-full w-full"
                  iconSize={48}
                  type={
                    blogPost.mediaType === "VIDEO"
                      ? blogPost.isBreaking
                        ? "BREAKING_VIDEO"
                        : "VIDEO"
                      : "IMAGE"
                  }
                />
              )}
              {blogPost.mediaType === "VIDEO" &&
                blogPost.featuredImage &&
                !imgError && (
                  <button
                    onClick={handlePlayClick}
                    className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/70 px-2 py-1 font-black text-white text-[11px] hover:bg-red-700 transition-colors"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    <span>{blogPost.videoDuration || "VIDEO"}</span>
                  </button>
                )}
            </>
          )}
        </div>

        <div className="flex flex-col">
          <div className="mb-2 flex items-center gap-2">
            <span className="font-black text-red-700 text-[11px] uppercase tracking-[0.2em]">
              {blogPost.badge || categoryName}
            </span>
            {blogPost.locationTag && (
              <>
                <span className="h-1 w-1 rounded-full bg-gray-300" />
                <span className="font-bold text-gray-500 text-[10px] uppercase tracking-widest">
                  {blogPost.locationTag}
                </span>
              </>
            )}
            <span className="h-1 w-1 rounded-full bg-gray-300" />
            <span className="font-bold text-gray-400 text-[10px] uppercase tracking-widest">
              {formatTimeAgo(blogPost.publishedAt || blogPost.createdAt)}
            </span>
            {blogPost.readingTimeMin && (
              <>
                <span className="h-1 w-1 rounded-full bg-gray-300" />
                <span className="font-bold text-gray-400 text-[10px] uppercase tracking-widest">
                  {blogPost.readingTimeMin}m
                </span>
              </>
            )}
          </div>

          <h2 className="line-clamp-2 mb-3 font-black text-gray-900 text-xl leading-tight transition-colors group-hover:text-red-700 md:text-2xl">
            {blogPost.title}
            {showStatus && (
              <span
                className={`ml-2 inline-flex items-center rounded-sm px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.1em] ${
                  blogPost.published
                    ? "bg-green-50 text-green-700"
                    : blogPost.status === "PENDING"
                      ? "bg-yellow-50 text-yellow-700"
                      : blogPost.status === "APPROVED"
                        ? "bg-blue-50 text-blue-700"
                        : blogPost.status === "REJECTED"
                          ? "bg-red-50 text-red-700"
                          : "bg-gray-50 text-gray-700"
                }`}
              >
                {blogPost.published
                  ? "Live"
                  : blogPost.status === "PENDING"
                    ? "Review"
                    : blogPost.status === "APPROVED"
                      ? "Approved"
                      : blogPost.status === "REJECTED"
                        ? "Rejected"
                        : "Draft"}
              </span>
            )}
          </h2>

          {blogPost.excerpt && (
            <p className="line-clamp-2 text-gray-600 text-sm leading-relaxed">
              {blogPost.excerpt}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}
