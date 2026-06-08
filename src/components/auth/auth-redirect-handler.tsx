import { useAuth } from "@/hooks/use-auth"
import { consumeAuthRedirect } from "@/lib/auth-redirect"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export function AuthRedirectHandler() {
    const { isAuthenticated, isLoading } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (isLoading || !isAuthenticated) return

        const redirectPath = consumeAuthRedirect()
        if (redirectPath !== "/") {
            navigate(redirectPath, { replace: true })
        }

        sessionStorage.removeItem("authJustCompleted")
    }, [isAuthenticated, isLoading, navigate])

    return null
}
