import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "@/hooks/use-axios-auth";
import type { BlogPost } from "@/types/blog.types";

interface UpdateBlogPostDto {
  title?: string;
  content?: string;
  excerpt?: string;
  featuredImage?: string;
  published?: boolean;
}

export const useUpdateBlogPost = (postId: string) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  return useMutation<BlogPost, Error, UpdateBlogPostDto>({
    mutationFn: async (data) => {
      const response = await axiosAuth.patch<BlogPost>(`blog/${postId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-post", postId] });
    },
  });
};












