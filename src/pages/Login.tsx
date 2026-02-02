import { AuthLayout } from "@/components/auth/auth-layout"
import { SigninForm } from "@/components/auth/signin-form"
import { AuthSkeleton } from "@/components/skeletons/auth-skeleton"
import { useAuth } from "@/hooks/use-auth"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function LoginPage() {
    const navigate = useNavigate()
    const { isAuthenticated, isLoading } = useAuth()

    useEffect(() => {
        // Redirect if already authenticated
        if (!isLoading && isAuthenticated) {
            navigate("/", { replace: true })
        }
    }, [isAuthenticated, isLoading, navigate])

    if (isLoading) {
        return <AuthSkeleton />
    }

    if (isAuthenticated) {
        return null // Will redirect
    }

    return (
        <AuthLayout>
            <SigninForm
                onSwitchToSignup={() => navigate("/signup", { replace: true })}
                onForgotPassword={() => navigate("/forgot-password", { replace: true })}
            />
        </AuthLayout>
    )
}
