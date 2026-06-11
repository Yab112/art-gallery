import { getServerBaseUrl } from "@/lib/api-config"
import { clearBearerToken, getBearerToken, setBearerToken } from "@/lib/bearer-token"
import { isWithinAuthGracePeriod } from "@/lib/auth-redirect"
import { useSession } from "@/lib/auth"
import axios, { type AxiosInstance } from "axios"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export const api: AxiosInstance = axios.create({
    baseURL: getServerBaseUrl(),
    timeout: 30000,
    withCredentials: true // Important for Better Auth cookies - cookies are sent automatically
})

// Log API base URL only in development
if (import.meta.env.DEV) {
    console.log("API base URL:", api.defaults.baseURL)
}

/** Paths viewable by guests. Don't redirect to login on 401 here (e.g. shared artwork links). */
function isPublicPath(pathname: string): boolean {
    if (!pathname || pathname === "/") return true
    if (/^\/auth\/callback(\/|$)/.test(pathname)) return true
    if (/^\/login(\/|$)/.test(pathname)) return true
    if (/^\/signup(\/|$)/.test(pathname)) return true
    if (/^\/forgot-password(\/|$)/.test(pathname)) return true
    if (/^\/reset-password(\/|$)/.test(pathname)) return true
    if (/^\/verify-email(\/|$)/.test(pathname)) return true
    if (/^\/artwork\/[^/]+(\/|$)/.test(pathname)) return true
    if (/^\/artist\/[^/]+(\/|$)/.test(pathname)) return true
    if (/^\/buyart(\/|$)/.test(pathname)) return true
    if (/^\/artists(\/|$)/.test(pathname)) return true
    if (/^\/collections(\/|$)/.test(pathname)) return true
    if (/^\/collections\/[^/]+(\/|$)/.test(pathname)) return true
    if (/^\/blog(\/|$)/.test(pathname)) return true
    if (/^\/blog\/[^/]+(\/|$)/.test(pathname)) return true
    if (/^\/how-it-works(\/|$)/.test(pathname)) return true
    return false
}

const useAxiosAuth = () => {
    const navigate = useNavigate()
    const { data: session, isPending } = useSession()

    useEffect(() => {
        // Capture token from URL if it exists (for OAuth redirects)
        const params = new URLSearchParams(window.location.search)
        const urlToken = params.get("token")
        if (urlToken) {
            setBearerToken(urlToken)
            window.history.replaceState({}, document.title, window.location.pathname)
        }

        const requestIntercept = api.interceptors.request.use(
            (config) => {
                const token = getBearerToken()
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`
                }
                return config
            },
            (error) => Promise.reject(error),
        )

        const responseIntercept = api.interceptors.response.use(
            (response) => {
                // Capture the bearer token from the set-auth-token header if present
                if (response.headers["set-auth-token"]) {
                    setBearerToken(response.headers["set-auth-token"])
                }
                return response
            },
            async (error) => {
                if (error.response?.status === 401) {
                    if (isPending || isWithinAuthGracePeriod()) {
                        return Promise.reject(error)
                    }
                    if (session?.user) return Promise.reject(error)

                    const currentPath = window.location.pathname
                    if (isPublicPath(currentPath)) {
                        return Promise.reject(error)
                    }

                    clearBearerToken()

                    const returnPath = encodeURIComponent(
                        window.location.pathname + window.location.search,
                    )
                    navigate(`/login?redirect=${returnPath}`, { replace: true })
                }
                return Promise.reject(error)
            }
        )

        return () => {
            api.interceptors.request.eject(requestIntercept)
            api.interceptors.response.eject(responseIntercept)
        }
    }, [navigate, isPending, session?.user])

    return api
}

export default useAxiosAuth
