import type { UseFetchOptions } from "nuxt/app";
import { useRuntimeConfig } from "nuxt/app";

/**
 * This is a wrapper around the useFetch hook that adds the JWT token to the request headers.
 * @param path - The path to the API endpoint (Must be relative to the backend API URL IE: /v1/users)
 * @param options - The options to pass to the useFetch hook
 * @returns The useFetch hook
 *
 * @example
 * ```ts
 * const { data, error, loading } = useApiFetch("/v1/users");
 * ```
 */
export function useApiFetch<T>(path: string, options: UseFetchOptions<T> = {}) {
  const runtimeConfig = useRuntimeConfig();
  const backendApi = runtimeConfig.public.backendApi;
  const baseUrl = runtimeConfig.publicsiteUrl;

  let headers: any = {
    accept: "application/json",
    referer: baseUrl,
  };

  // The JWT token is stored in a cookie
  const token = useCookie("token").value;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (process.server) {
    headers = {
      ...headers,
    };
  }

  return useFetch(backendApi + path, {
    ...options,
    headers: {
      ...headers,
      ...options?.headers,
    },
  });
}
