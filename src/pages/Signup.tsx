import { AuthLayout } from "@/components/auth/auth-layout"
import { SignupForm } from "@/components/auth/signup-form"
import { AuthSkeleton } from "@/components/skeletons/auth-skeleton"
import { useAuth } from "@/hooks/use-auth"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function SignupPage() {
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
            <SignupForm onSwitchToSignin={() => navigate("/login", { replace: true })} />
        </AuthLayout>
    )
}
