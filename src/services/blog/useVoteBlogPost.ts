import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "@/hooks/use-axios-auth";

interface VoteDto {
  type: "LIKE" | "DISLIKE";
}

interface VoteResponse {
  message: string;
  data: {
    blogPostId: string;
    voteType: "LIKE" | "DISLIKE" | null;
    likes: number;
    dislikes: number;
  };
}

export const useVoteBlogPost = (blogPostId: string) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (voteDto: VoteDto) => {
      const response = await axiosAuth.post<VoteResponse>(
        `blog/${blogPostId}/vote`,
        voteDto
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate blog post query to refetch with updated vote counts
      queryClient.invalidateQueries({ queryKey: ["blog-post", blogPostId] });
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
    },
  });
};












