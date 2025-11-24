import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "@/hooks/use-axios-auth";
import type { BlogPost } from "@/types/blog.types";

export const usePublishBlogPost = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  return useMutation<BlogPost, Error, string>({
    mutationFn: async (postId) => {
      const response = await axiosAuth.post<BlogPost>(`blog/${postId}/publish`);
      return response.data;
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-post", postId] });
    },
  });
};

