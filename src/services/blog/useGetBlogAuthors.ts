import useAxiosAuth from "@/hooks/use-axios-auth"
import { useQuery } from "@tanstack/react-query"

export interface BlogAuthor {
    id: string
    name: string
    email: string
    image?: string
}

export const useGetBlogAuthors = () => {
    const axiosAuth = useAxiosAuth()

    return useQuery<BlogAuthor[]>({
        queryKey: ["blog-authors"],
        queryFn: async () => {
            const response = await axiosAuth.get<BlogAuthor[]>("blog/authors")
            return response.data
        },
        staleTime: 5 * 60 * 1000 // 5 minutes
    })
}
