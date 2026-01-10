import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/hooks/use-axios-auth";
import type { BlogPost } from "@/types/blog.types";

export const useGetBlogPost = (idOrSlug: string, incrementViews = false) => {
  const axiosAuth = useAxiosAuth();

  return useQuery<BlogPost>({
    queryKey: ["blog-post", idOrSlug],
    queryFn: async () => {
      const url = `blog/${idOrSlug}${incrementViews ? "?incrementViews=true" : ""}`;
      const response = await axiosAuth.get<BlogPost>(url);
      return response.data;
    },
    enabled: !!idOrSlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};












