import { AuthLayout } from "@/components/auth/auth-layout"
import { SignupForm } from "@/components/auth/signup-form"
import { AuthSkeleton } from "@/components/skeletons/auth-skeleton"
import { useAuth } from "@/hooks/use-auth"
import { getSafeRedirectPath } from "@/lib/auth-redirect"
import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

export default function SignupPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const redirectTo = getSafeRedirectPath(searchParams)
    const { isAuthenticated, isLoading } = useAuth()

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            navigate(redirectTo, { replace: true })
        }
    }, [isAuthenticated, isLoading, navigate, redirectTo])

    if (isLoading) {
        return <AuthSkeleton />
    }

    if (isAuthenticated) {
        return null
    }

    const loginPath =
        redirectTo === "/"
            ? "/login"
            : `/login?redirect=${encodeURIComponent(redirectTo)}`

    return (
        <AuthLayout variant="page">
            <SignupForm
                redirectTo={redirectTo}
                onSwitchToSignin={() => navigate(loginPath, { replace: true })}
            />
        </AuthLayout>
    )
}
