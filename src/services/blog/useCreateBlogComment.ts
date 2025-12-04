import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "@/hooks/use-axios-auth";
import type { BlogComment } from "@/types/blog.types";

interface CreateCommentDto {
  content: string;
  parentId?: string;
}

export const useCreateBlogComment = (blogPostId: string) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCommentDto) => {
      const response = await axiosAuth.post<{ message: string; data: BlogComment }>(
        `blog/${blogPostId}/comments`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate comments query to refetch
      queryClient.invalidateQueries({ queryKey: ["blog-comments", blogPostId] });
    },
  });
};








