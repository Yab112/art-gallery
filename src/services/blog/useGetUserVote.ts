import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/hooks/use-axios-auth";
import type { BlogVote } from "@/types/blog.types";

export const useGetUserVote = (blogPostId: string) => {
  const axiosAuth = useAxiosAuth();

  return useQuery<BlogVote>({
    queryKey: ["blog-vote", blogPostId],
    queryFn: async () => {
      const response = await axiosAuth.get<BlogVote>(
        `blog/${blogPostId}/vote`
      );
      return response.data;
    },
    enabled: !!blogPostId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

