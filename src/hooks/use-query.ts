import {
    type UseQueryOptions,
    type UseQueryResult,
    keepPreviousData,
    useQuery,
  } from "@tanstack/react-query";
  import { AxiosError } from "axios";
  import useAxiosAuth from "./use-axios-auth";
  
  type FetchDataOptions<T> = Omit<UseQueryOptions<T>, "queryKey" | "queryFn">;
  type UseFetchDataOptions<T> = FetchDataOptions<T> & {
    onSuccess?: (data: T) => void;
  };
  
  export const useFetchData = <T>(
    queryKey: readonly unknown[],
    url: string,
    options?: UseFetchDataOptions<T>
  ): UseQueryResult<T> => {
    const axiosAuth = useAxiosAuth();
    return useQuery<T>({
      queryKey,
      queryFn: async () => {
        try {
          const response = await axiosAuth.get<T>(`/${url}`);
          options?.onSuccess?.(response?.data);
          return response.data;
        } catch (error) {
          if (error instanceof AxiosError) {
            const network_error = error.code === "ERR_NETWORK";
            const errorToThrow = {
              message: network_error
                ? error?.message
                : error.response?.data?.message,
              errors: network_error ? [] : error.response?.data?.errors,
            };
            throw new Error(errorToThrow?.message);
          }
          throw error;
        }
      },
      ...(options?.refetchInterval && {
        refetchInterval: options?.refetchInterval,
      }),
      staleTime: options?.staleTime ?? 5 * 60 * 1000,
      enabled: options?.enabled ?? true,
  
      placeholderData: keepPreviousData,
    });
  };
  