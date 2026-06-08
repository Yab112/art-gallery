import { getApiBaseUrl } from "@/lib/api-config"
import { captureAuthTokenFromResponse, getBearerToken } from "@/lib/bearer-token"
import { useEffect } from "react"

/**
 * After OAuth redirect, cookies may not reach the API cross-domain.
 * Backend exposes GET /api/auth/get-bearer-token when bearer-token-confirmation is set.
 */
export function BearerTokenBootstrap() {
    useEffect(() => {
        if (getBearerToken()) return

        const baseUrl = getApiBaseUrl()
        fetch(`${baseUrl}/api/auth/get-bearer-token`, {
            credentials: "include",
        })
            .then((response) => {
                if (response.ok) {
                    captureAuthTokenFromResponse(response)
                }
            })
            .catch(() => {
                // No pending OAuth session — ignore
            })
    }, [])

    return null
}
