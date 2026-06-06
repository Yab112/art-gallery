import useAxiosAuth from "@/hooks/use-axios-auth"
import type { BlogPostListResponse, BlogPostQueryParams } from "@/types/blog.types"
import { useInfiniteQuery } from "@tanstack/react-query"

export const useGetBlogPostsInfinite = (params?: BlogPostQueryParams) => {
    const axiosAuth = useAxiosAuth()

    return useInfiniteQuery<BlogPostListResponse>({
        queryKey: ["blog-posts-infinite", params],
        queryFn: async ({ pageParam = 1 }) => {
            const searchParams = new URLSearchParams()
            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && key !== 'page') {
                        searchParams.append(key, String(value))
                    }
                })
            }
            searchParams.append('page', String(pageParam))
            
            const response = await axiosAuth.get<BlogPostListResponse>(`blog?${searchParams.toString()}`)
            return response.data
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.page < lastPage.totalPages) {
                return lastPage.page + 1
            }
            return undefined
        },
        staleTime: 2 * 60 * 1000 // 2 minutes
    })
}
