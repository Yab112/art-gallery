import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/hooks/use-axios-auth";
import type { BlogVote } from "@/types/blog.types";

export type UseGetUserVoteOptions = { enabled?: boolean };

/** Skip when guest (enabled: false) — vote API requires auth. */
export const useGetUserVote = (
  blogPostId: string,
  options?: UseGetUserVoteOptions
) => {
  const axiosAuth = useAxiosAuth();

  return useQuery<BlogVote>({
    queryKey: ["blog-vote", blogPostId],
    queryFn: async () => {
      const response = await axiosAuth.get<BlogVote>(
        `blog/${blogPostId}/vote`
      );
      return response.data;
    },
    enabled: !!blogPostId && (options?.enabled ?? true),
    staleTime: 5 * 60 * 1000,
  });
};











