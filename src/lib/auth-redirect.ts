import { getSession } from "@/lib/auth"

export function getSafeRedirectPath(searchParams: URLSearchParams): string {
    const redirect = searchParams.get("redirect")

    if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
        return "/"
    }

    return redirect
}

export function storeAuthRedirect(path: string) {
    if (typeof window === "undefined") return
    sessionStorage.setItem("authRedirect", path)
}

export function consumeAuthRedirect(fallback = "/"): string {
    if (typeof window === "undefined") return fallback

    const stored = sessionStorage.getItem("authRedirect")
    sessionStorage.removeItem("authRedirect")

    if (stored && stored.startsWith("/") && !stored.startsWith("//")) {
        return stored
    }

    return fallback
}

export async function completeAuthRedirect(path: string) {
    sessionStorage.setItem("authJustCompleted", Date.now().toString())

    for (let attempt = 0; attempt < 10; attempt++) {
        const session = await getSession()

        if (session?.data?.user) {
            window.location.assign(path)
            return
        }

        await new Promise((resolve) => setTimeout(resolve, 150))
    }

    // Session may still work via bearer token even if getSession is slow
    window.location.assign(path)
}

export function isWithinAuthGracePeriod(): boolean {
    if (typeof window === "undefined") return false

    const timestamp = sessionStorage.getItem("authJustCompleted")
    if (!timestamp) return false

    return Date.now() - Number(timestamp) < 5000
}
