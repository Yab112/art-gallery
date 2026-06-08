import { AuthLayout } from "@/components/auth/auth-layout"
import { SigninForm } from "@/components/auth/signin-form"
import { AuthSkeleton } from "@/components/skeletons/auth-skeleton"
import { useAuth } from "@/hooks/use-auth"
import { getSafeRedirectPath } from "@/lib/auth-redirect"
import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

export default function LoginPage() {
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

    const signupPath =
        redirectTo === "/"
            ? "/signup"
            : `/signup?redirect=${encodeURIComponent(redirectTo)}`

    return (
        <AuthLayout variant="page">
            <SigninForm
                redirectTo={redirectTo}
                onSwitchToSignup={() => navigate(signupPath, { replace: true })}
                onForgotPassword={() => navigate("/forgot-password", { replace: true })}
            />
        </AuthLayout>
    )
}
