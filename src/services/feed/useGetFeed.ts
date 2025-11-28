import { followKeys } from "@/queries/queryKeys";
import { useFetchData } from "@/hooks/use-query";

export interface FeedArtworkItem {
  id: string;
  title?: string;
  artist: string;
  photos: string[];
  desiredPrice: number;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image?: string;
  };
}

export interface FeedBlogPostItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: string;
  publishedAt?: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    image?: string;
  };
  views: number;
  likes: number;
}

export interface FeedItem {
  type: "artwork" | "blog_post";
  id: string;
  createdAt: string;
  artwork?: FeedArtworkItem;
  blogPost?: FeedBlogPostItem;
}

export interface FeedResponse {
  success: boolean;
  message: string;
  items: FeedItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const useGetFeed = (
  page: number = 1,
  limit: number = 20,
  type: "all" | "artworks" | "blog_posts" = "all"
) => {
  return useFetchData<FeedResponse>(
    [...followKeys.all(), "feed", page, limit, type],
    `feed?page=${page}&limit=${limit}&type=${type}`
  );
};

