import { useEffect } from "react";
import axios, { AxiosInstance } from "axios";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/lib/auth";

export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_BASE_URL || "http://13.48.147.113:3099/api/",
  timeout: 10000, 
  withCredentials: true, // Important for Better Auth cookies - cookies are sent automatically
});

console.log("API base URL:", api.defaults.baseURL);

const useAxiosAuth = () => {
  const navigate = useNavigate();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    const requestIntercept = api.interceptors.request.use(
      (config) => {
        // Better Auth handles authentication via cookies automatically
        // No need to call getSession() on every request - cookies are sent with withCredentials: true
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseIntercept = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Don't redirect if session is still loading - might be a timing issue
          if (isPending) {
            return Promise.reject(error);
          }

          // Don't redirect if user is already authenticated (might be a temporary API issue)
          if (session?.user) {
            return Promise.reject(error);
          }

          // Only redirect if user is not authenticated and not on auth pages
          const currentPath = window.location.pathname;
          if (
            !currentPath.includes("/login") &&
            !currentPath.includes("/signup") &&
            !currentPath.includes("/forgot-password") &&
            !currentPath.includes("/reset-password") &&
            !currentPath.includes("/verify-email")
          ) {
            navigate("/login", { replace: true });
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestIntercept);
      api.interceptors.response.eject(responseIntercept);
    };
  }, [navigate]);

  return api;
};

export default useAxiosAuth;
