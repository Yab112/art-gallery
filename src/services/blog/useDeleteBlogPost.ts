import useAxiosAuth from "@/hooks/use-axios-auth"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useDeleteBlogPost = () => {
    const axiosAuth = useAxiosAuth()
    const queryClient = useQueryClient()

    return useMutation<void, Error, string>({
        mutationFn: async (postId) => {
            await axiosAuth.delete(`blog/${postId}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["blog-posts"] })
        }
    })
}
