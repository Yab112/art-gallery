import useAxiosAuth from "@/hooks/use-axios-auth"
import type { BlogPost } from "@/types/blog.types"
import { useMutation, useQueryClient } from "@tanstack/react-query"

interface CreateBlogPostDto {
    title: string
    content: string
    excerpt?: string
    featuredImage?: string
    published?: boolean
    mediaType?: "IMAGE" | "VIDEO"
    videoUrl?: string
    contentDocument?: any
}

export const useCreateBlogPost = () => {
    const axiosAuth = useAxiosAuth()
    const queryClient = useQueryClient()

    return useMutation<BlogPost, Error, CreateBlogPostDto>({
        mutationFn: async (data) => {
            const response = await axiosAuth.post<BlogPost>("blog", data)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["blog-posts"] })
        }
    })
}
