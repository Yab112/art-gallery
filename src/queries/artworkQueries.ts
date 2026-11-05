import { useSession } from "@/lib/auth"
import useAxiosAuth, { publicApi } from "@/hooks/use-axios-auth"
import { useFetchData } from "@/hooks/use-query"
import type { Artwork, ArtworkListResponse, ArtworkQueryParams } from "@/types/artwork.types"
import {
    type UseQueryOptions,
    keepPreviousData,
    useInfiniteQuery,
    useQuery,
} from "@tanstack/react-query"
import { artworkKeys } from "./queryKeys"

// Query Hooks
export const useArtworks = (
    params?: ArtworkQueryParams,
    options?: Partial<UseQueryOptions<ArtworkListResponse>>
) => {
    const queryString = params
        ? (() => {
            const searchParams = new URLSearchParams()
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (Array.isArray(value)) {
                        // For arrays, add each item as a separate query param (NestJS will parse as array)
                        value.forEach((item) => {
                            searchParams.append(key, String(item))
                        })
                    } else {
                        searchParams.append(key, String(value))
                    }
                }
            })
            return searchParams.toString()
        })()
        : ""


    return useQuery<ArtworkListResponse>({
        queryKey: artworkKeys.list(params),
        queryFn: async () => {
            const response = await publicApi.get<{
                artworks: any[]
                pagination?: {
                    page: number
                    limit: number
                    total: number
                    pages: number
                }
            }>(`artworks${queryString ? `?${queryString}` : ""}`)

            // Transform backend response to match ArtworkListResponse format
            const data = response.data
            if (data.pagination) {
                return {
                    success: true,
                    artworks: data.artworks || [],
                    page: data.pagination.page,
                    limit: data.pagination.limit,
                    total: data.pagination.total,
                    pages: data.pagination.pages
                }
            }

            // Fallback if pagination is not present (shouldn't happen, but just in case)
            return {
                success: true,
                artworks: data.artworks || [],
                page: params?.page || 1,
                limit: params?.limit || 10,
                total: data.artworks?.length || 0,
                pages: 1
            }
        },
        refetchInterval: false, // Disable auto-refetch to prevent flickering
        staleTime: 10 * 60 * 1000, // Increase stale time to 10 minutes
        placeholderData: keepPreviousData,
        refetchOnWindowFocus: false, // Prevent refetch on window focus
        ...options
    })
}

const buildArtworkQueryString = (params?: ArtworkQueryParams) => {
    if (!params) return ""

    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== "page") {
            if (Array.isArray(value)) {
                value.forEach((item) => {
                    searchParams.append(key, String(item))
                })
            } else {
                searchParams.append(key, String(value))
            }
        }
    })
    return searchParams.toString()
}

export const useArtworksInfinite = (params?: ArtworkQueryParams) => {
    const limit = params?.limit ?? 12

    return useInfiniteQuery<ArtworkListResponse>({
        queryKey: [...artworkKeys.list(params), "infinite"],
        queryFn: async ({ pageParam = 1 }) => {
            const queryString = buildArtworkQueryString({ ...params, limit })
            const pageQuery = queryString
                ? `${queryString}&page=${pageParam}`
                : `page=${pageParam}&limit=${limit}`

            const response = await publicApi.get<{
                artworks: any[]
                pagination?: {
                    page: number
                    limit: number
                    total: number
                    pages: number
                }
            }>(`artworks?${pageQuery}`)

            const data = response.data
            if (data.pagination) {
                return {
                    success: true,
                    artworks: data.artworks || [],
                    page: data.pagination.page,
                    limit: data.pagination.limit,
                    total: data.pagination.total,
                    pages: data.pagination.pages,
                }
            }

            return {
                success: true,
                artworks: data.artworks || [],
                page: Number(pageParam),
                limit,
                total: data.artworks?.length || 0,
                pages: 1,
            }
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.page < lastPage.pages) {
                return lastPage.page + 1
            }
            return undefined
        },
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    })
}

export const useArtwork = (id: string) => {
    return useFetchData<{ success: boolean; artwork: Artwork }>(
        artworkKeys.detail(id),
        `artworks/${id}`,
        {
            enabled: !!id
        }
    )
}

/**
 * Artwork detail for the public page. Everyone gets the CDN-cached anonymous
 * view immediately; logged-in users additionally fetch the personalised view
 * (isLiked, owner data, disputed artworks they may see), which takes over once
 * it arrives. EditArtwork keeps using useArtwork (always personalised).
 */
export const useArtworkDetail = (id: string) => {
    const { data: session, isPending: sessionPending } = useSession()
    const loggedIn = !!session?.user

    const publicQuery = useQuery<{ success: boolean; artwork: Artwork }>({
        queryKey: [...artworkKeys.detail(id), "public"],
        queryFn: async ({ signal }) =>
            (await publicApi.get<{ success: boolean; artwork: Artwork }>(`/artworks/${id}/public`, { signal })).data,
        enabled: !!id,
        retry: false
    })

    const fullQuery = useFetchData<{ success: boolean; artwork: Artwork }>(artworkKeys.detail(id), `artworks/${id}`, {
        enabled: !!id && !sessionPending && loggedIn
    })

    const data = (loggedIn && fullQuery.data) || publicQuery.data || fullQuery.data
    const waitingForFull = loggedIn && fullQuery.isLoading
    const isLoading = !data && (publicQuery.isLoading || waitingForFull || (sessionPending && !!publicQuery.error))
    const error = data || isLoading ? null : loggedIn ? (fullQuery.error ?? publicQuery.error) : publicQuery.error

    return { data, isLoading, error }
}

export const useMyArtworks = (params?: {
    page?: number
    limit?: number
    status?: string
    technique?: string
    sortBy?: string
    orderBy?: string
}) => {
    const axiosAuth = useAxiosAuth()

    // Build query string from all params
    const queryString = params
        ? (() => {
            const searchParams = new URLSearchParams()
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    searchParams.append(key, String(value))
                }
            })
            return searchParams.toString()
        })()
        : `page=1&limit=10`

    return useQuery<ArtworkListResponse>({
        queryKey: artworkKeys.myArtworksList(params?.page || 1, params?.limit || 10, params),
        queryFn: async () => {
            const response = await axiosAuth.get<{
                artworks: any[]
                pagination?: {
                    page: number
                    limit: number
                    total: number
                    pages: number
                }
            }>(`artworks/my-artworks?${queryString}`)

            const data = response.data
            if (data.pagination) {
                return {
                    success: true,
                    artworks: data.artworks || [],
                    page: data.pagination.page,
                    limit: data.pagination.limit,
                    total: data.pagination.total,
                    pages: data.pagination.pages
                }
            }

            return {
                success: true,
                artworks: data.artworks || [],
                page: params?.page || 1,
                limit: params?.limit || 10,
                total: data.artworks?.length || 0,
                pages: 1
            }
        },
        placeholderData: keepPreviousData,
        staleTime: 5 * 60 * 1000
    })
}

/**
 * Get artworks similar to a specific artwork
 * Finds artworks that share categories with the given artwork
 */
export const useSimilarArtworks = (artworkId: string, limit = 12) => {
    const axiosAuth = useAxiosAuth()

    return useQuery<{ success: boolean; artworks: Artwork[] }>({
        queryKey: [...artworkKeys.detail(artworkId), "similar", limit],
        queryFn: async () => {
            const response = await axiosAuth.get<{ success: boolean; artworks: Artwork[] }>(
                `artworks/${artworkId}/similar-artworks?limit=${limit}`
            )
            return response.data
        },
        enabled: !!artworkId,
        staleTime: 5 * 60 * 1000 // 5 minutes
    })
}
