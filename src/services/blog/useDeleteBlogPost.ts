import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "@/hooks/use-axios-auth";

export const useDeleteBlogPost = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (postId) => {
      await axiosAuth.delete(`blog/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
    },
  });
};











