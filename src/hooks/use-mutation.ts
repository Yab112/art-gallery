import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError, type AxiosRequestConfig } from "axios";
import useAxiosAuth from "@/hooks/use-axios-auth";

export type MutationOptions<TRequestBody = unknown> = {
  url: string;
  method: AxiosRequestConfig["method"];
  body?: TRequestBody;
  headers?: AxiosRequestConfig["headers"];
};

export type ApiErrorResponse = {
  message?: string;
  code?: number | string;
  errors?: unknown[];
};

interface UseMutationFuncOptions<
  TResponseData,
  TRequestBody,
  TError = ApiErrorResponse
> {
  onSuccess?: (
    data: TResponseData,
    options: MutationOptions<TRequestBody>
  ) => void;
  onError?: (
    error: TError,
    options?: MutationOptions<TRequestBody>,
    context?: { previousData: unknown }
  ) => void;
  onMutate?: (
    oldData: unknown,
    options: MutationOptions<TRequestBody>
  ) => unknown;
  queryKey?: readonly (string | number)[];
  defaultErrorMessage?: string;
}

const useMutationFunc = <
  TResponseData,
  TRequestBody,
  TError = ApiErrorResponse
>(
  options?: UseMutationFuncOptions<TResponseData, TRequestBody, TError>
) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  return useMutation<
    TResponseData,
    TError,
    MutationOptions<TRequestBody>,
    { previousData: unknown }
  >({
    mutationFn: async (mutationOptions) => {
      const { url, method, body, headers } = mutationOptions;
      console.log("Making API request:", { url, method, body, headers });
      const response = await axiosAuth.request<TResponseData>({
        url,
        method,
        headers,
        data: body,
      });
      console.log("API response:", response.data);
      return response.data;
    },
    onMutate: (mutationOptions) => {
      if (!options?.queryKey || !options?.onMutate)
        return { previousData: undefined };
      queryClient.cancelQueries({ queryKey: options.queryKey });
      const previousData = queryClient.getQueryData(options.queryKey);
      queryClient.setQueryData(
        options.queryKey,
        (oldData: unknown) =>
          options.onMutate?.(oldData, mutationOptions) ?? oldData
      );
      return { previousData };
    },
    onSuccess: (data, mutationOptions) => {
      options?.onSuccess?.(data, mutationOptions);
      if (options?.queryKey) {
        queryClient.invalidateQueries({
          queryKey: options.queryKey,
          exact: true,
        });
      }
    },
    onError: (error, mutationOptions, context) => {
      if (context?.previousData && options?.queryKey) {
        queryClient.setQueryData(options.queryKey, context.previousData);
      }
      const errorToThrow =
        error instanceof AxiosError
          ? ({
              message:
                error.code === "ERR_NETWORK"
                  ? "Network error occurred"
                  : error.response?.data?.message ||
                    options?.defaultErrorMessage ||
                    "An error occurred",
              code: error.code === "ERR_NETWORK" ? 500 : error.response?.status,
              errors: error.response?.data?.errors || [],
            } as TError)
          : error;
      options?.onError?.(errorToThrow, mutationOptions, context);
    },
  });
};

export default useMutationFunc;
