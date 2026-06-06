import { Artwork } from "./artwork.types";

export type BlogPostLayout = "HERO" | "STANDARD" | "COMPACT" | "LINK_ONLY";
export type MediaType = "IMAGE" | "VIDEO" | "LIVE_STREAM";

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface BlogTopic {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export type BlogPostStatus =
  | "DRAFT"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "ARCHIVED";

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

export interface BlogMedia {
  id: string;
  url: string;
  type: string;
  alt?: string;
  order: number;
}

export interface BlogReference {
  id: string;
  title: string;
  url: string;
}

export interface BlogPollOption {
  id: string;
  text: string;
  votes: number;
}

export interface BlogPoll {
  id: string;
  question: string;
  options: BlogPollOption[];
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;

  // Content Redesign Fields
  contentDocument?: any; // TipTap JSON
  contentHtml?: string;
  contentFormat: string;

  layout: BlogPostLayout;
  badge?: string;
  authorId: string;
  author?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  status: BlogPostStatus;
  published: boolean;
  publishedAt?: string;
  isLive: boolean;
  isBreaking: boolean;
  isDrop: boolean;
  dropDate?: string;
  mediaType: MediaType;
  videoUrl?: string;
  videoDuration?: string;
  priority: number;
  readingTimeMin?: number;
  locationTag?: string;
  ctaText?: string;
  ctaLink?: string;

  views: number;
  likes: number;
  dislikes: number;
  shares: number;

  lastAutoSavedAt?: string;
  createdAt: string;
  updatedAt: string;
  editedAt?: string;

  categoryId?: string;
  category?: BlogCategory;
  topicId?: string;
  topic?: BlogTopic;
  featuredArtistId?: string;
  featuredArtist?: {
    id: string;
    name: string;
    image?: string;
  };
  relatedArtworks?: {
    artwork: Artwork;
  }[];

  // Redesign Relations
  tags?: { tag: BlogTag }[];
  media?: BlogMedia[];
  references?: BlogReference[];
  polls?: BlogPoll[];
}

export interface BlogPostListResponse {
  data: BlogPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BlogPostQueryParams {
  page?: number;
  limit?: number;
  published?: boolean;
  search?: string;
  authorId?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  sortBy?:
    | "createdAt"
    | "updatedAt"
    | "publishedAt"
    | "views"
    | "title"
    | "likes"
    | "priority";
  sortOrder?: "asc" | "desc";
  categoryId?: string;
  topicId?: string;
  isBreaking?: boolean;
  isLive?: boolean;
  isDrop?: boolean;
  minPriority?: number;
}

export interface BlogComment {
  id: string;
  blogPostId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  content: string;
  parentId?: string;
  parent?: BlogComment;
  replies?: BlogComment[];
  likes: number;
  dislikes: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    replies: number;
  };
}

export interface BlogCommentListResponse {
  data: BlogComment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BlogVote {
  voteType: "LIKE" | "DISLIKE" | null;
}
