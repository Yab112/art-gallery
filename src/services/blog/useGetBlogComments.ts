import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/hooks/use-axios-auth";
import type { BlogCommentListResponse } from "@/types/blog.types";

export const useGetBlogComments = (
  blogPostId: string,
  page = 1,
  limit = 20
) => {
  const axiosAuth = useAxiosAuth();

  return useQuery<BlogCommentListResponse>({
    queryKey: ["blog-comments", blogPostId, page, limit],
    queryFn: async () => {
      const response = await axiosAuth.get<BlogCommentListResponse>(
        `blog/${blogPostId}/comments?page=${page}&limit=${limit}`
      );
      return response.data;
    },
    enabled: !!blogPostId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

