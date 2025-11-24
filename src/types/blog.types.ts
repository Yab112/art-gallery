export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  authorId: string;
  author?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  published: boolean;
  publishedAt?: string;
  views: number;
  likes: number;
  dislikes: number;
  shares: number;
  createdAt: string;
  updatedAt: string;
  editedAt?: string;
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
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  sortBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'views' | 'title' | 'likes';
  sortOrder?: 'asc' | 'desc';
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
  voteType: 'LIKE' | 'DISLIKE' | null;
}

