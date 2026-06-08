const BEARER_TOKEN_KEY = "bearer_token"

export function getBearerToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(BEARER_TOKEN_KEY)
}

export function setBearerToken(token: string) {
    if (typeof window === "undefined") return
    localStorage.setItem(BEARER_TOKEN_KEY, token)
}

export function clearBearerToken() {
    if (typeof window === "undefined") return
    localStorage.removeItem(BEARER_TOKEN_KEY)
}

export function captureAuthTokenFromResponse(response: Response) {
    const authToken = response.headers.get("set-auth-token")
    if (authToken) {
        setBearerToken(authToken)
    }
}
