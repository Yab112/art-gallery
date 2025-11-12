import { useEffect } from "react";
import axios, { AxiosInstance } from "axios";
import { useNavigate } from "react-router-dom";

export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api/",
  timeout: 10000,
  withCredentials: true, // Important for Better Auth cookies - cookies are sent automatically
});

console.log("API base URL:", api.defaults.baseURL);

const useAxiosAuth = () => {
  const navigate = useNavigate();

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
          // Unauthorized - Better Auth will handle this via cookies
          // Redirect to login if needed
          const currentPath = window.location.pathname;
          if (
            !currentPath.includes("/login") &&
            !currentPath.includes("/signup")
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
