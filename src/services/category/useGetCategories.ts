import { api } from "@/hooks/use-axios-auth"
import { useQuery } from "@tanstack/react-query"

export interface Category {
    id: string
    name: string
    slug: string
    description?: string
    image?: string
    artworkCount?: number
    createdAt: string
    updatedAt: string
}

interface CategoriesResponse {
    success?: boolean
    categories?: Category[]
    // If backend returns array directly
}

export const useGetCategories = () => {
    return useQuery<Category[]>({
        queryKey: ["categories"],
        queryFn: async () => {
            const response = await api.get<CategoriesResponse | Category[]>("/categories")

            // Handle both response formats
            const data = response.data
            if (Array.isArray(data)) {
                return data
            }
            if (data && "categories" in data && Array.isArray(data.categories)) {
                return data.categories
            }
            return []
        },
        staleTime: 30 * 60 * 1000, // 30 minutes - longer cache since categories don't change often
        gcTime: 60 * 60 * 1000 // 1 hour garbage collection time
    })
}
