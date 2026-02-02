import useAxiosAuth from "@/hooks/use-axios-auth"
import type { BlogPostListResponse, BlogPostQueryParams } from "@/types/blog.types"
import { useQuery } from "@tanstack/react-query"

export const useGetBlogPosts = (params?: BlogPostQueryParams) => {
    const axiosAuth = useAxiosAuth()

    const queryString = params
        ? (() => {
              const searchParams = new URLSearchParams()
              Object.entries(params).forEach(([key, value]) => {
                  if (value !== undefined && value !== null) {
                      searchParams.append(key, String(value))
                  }
              })
              return searchParams.toString()
          })()
        : ""

    return useQuery<BlogPostListResponse>({
        queryKey: ["blog-posts", params],
        queryFn: async () => {
            const url = queryString ? `blog?${queryString}` : "blog"
            const response = await axiosAuth.get<BlogPostListResponse>(url)
            return response.data
        },
        staleTime: 2 * 60 * 1000 // 2 minutes
    })
}
