import { AuthSkeleton } from "@/components/skeletons/auth-skeleton"
import { consumeAuthRedirect } from "@/lib/auth-redirect"
import { setBearerToken } from "@/lib/bearer-token"
import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

/**
 * Google OAuth handoff lands here with ?token= from backend oauth-handoff route.
 * Stores bearer token then sends user to their intended destination.
 */
export default function AuthCallbackPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    useEffect(() => {
        const token = searchParams.get("token")

        if (!token) {
            navigate("/login", { replace: true })
            return
        }

        setBearerToken(token)
        sessionStorage.setItem("authJustCompleted", Date.now().toString())

        const redirectTo = consumeAuthRedirect("/")
        navigate(redirectTo, { replace: true })
    }, [navigate, searchParams])

    return <AuthSkeleton />
}
