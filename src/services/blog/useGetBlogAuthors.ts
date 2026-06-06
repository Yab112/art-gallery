import useAxiosAuth from "@/hooks/use-axios-auth"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"

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
            try {
                const response = await axiosAuth.get<BlogAuthor[]>("blog/authors")
                return response.data
            } catch (error) {
                // Public blog page: authors endpoint may require auth
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    return []
                }
                throw error
            }
        },
        staleTime: 5 * 60 * 1000,
        retry: false,
    })
}
