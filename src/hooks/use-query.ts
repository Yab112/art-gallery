import {
    type UseQueryOptions,
    type UseQueryResult,
    keepPreviousData,
    useQuery
} from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import useAxiosAuth from "./use-axios-auth"

type FetchDataOptions<T> = Omit<UseQueryOptions<T>, "queryKey" | "queryFn">
type UseFetchDataOptions<T> = FetchDataOptions<T> & {
    onSuccess?: (data: T) => void
}

export const useFetchData = <T>(
    queryKey: readonly unknown[],
    url: string,
    options?: UseFetchDataOptions<T>
): UseQueryResult<T> => {
    const axiosAuth = useAxiosAuth()
    return useQuery<T>({
        queryKey,
        queryFn: async ({ signal }) => {
            try {
                const response = await axiosAuth.get<T>(`/${url}`, {
                    signal // Pass the abort signal to axios
                })
                options?.onSuccess?.(response?.data)
                return response.data
            } catch (error) {
                // Don't throw error if request was canceled
                if (
                    axios.isCancel(error) ||
                    (error instanceof AxiosError && error.code === "ERR_CANCELED")
                ) {
                    throw error // Let React Query handle cancellation
                }
                if (error instanceof AxiosError) {
                    const network_error = error.code === "ERR_NETWORK"
                    const errorToThrow = {
                        message: network_error ? error?.message : error.response?.data?.message,
                        errors: network_error ? [] : error.response?.data?.errors
                    }
                    throw new Error(errorToThrow?.message)
                }
                throw error
            }
        },
        ...(options?.refetchInterval && {
            refetchInterval: options?.refetchInterval
        }),
        staleTime: options?.staleTime ?? 5 * 60 * 1000,
        enabled: options?.enabled ?? true,
        retry: 1, // Retry once on failure
        retryOnMount: true, // Retry when component remounts
        refetchOnWindowFocus: false, // Prevent refetch on window focus to avoid cancellations
        placeholderData: keepPreviousData
    })
}
