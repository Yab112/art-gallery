import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "@/hooks/use-axios-auth";

interface ShareDto {
  platform?: string;
}

interface ShareResponse {
  message: string;
  data: {
    blogPostId: string;
    shares: number;
  };
}

export const useShareBlogPost = (blogPostId: string) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shareDto: ShareDto) => {
      const response = await axiosAuth.post<ShareResponse>(
        `blog/${blogPostId}/share`,
        shareDto
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate blog post query to refetch with updated share count
      queryClient.invalidateQueries({ queryKey: ["blog-post", blogPostId] });
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
    },
  });
};


