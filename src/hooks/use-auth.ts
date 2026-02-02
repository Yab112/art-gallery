import { signOut, useSession } from "@/lib/auth"
import type { User } from "@/lib/auth"
import { useNavigate } from "react-router-dom"

/**
 * Custom hook for authentication state and actions
 * Provides easy access to user session and auth methods
 */
export const useAuth = () => {
    const { data: session, isPending, error } = useSession()
    const navigate = useNavigate()

    // Better Auth useSession returns { data: session, isPending, error }
    // session has { user, session } structure
    const user: User | null = session?.user || null
    const isAuthenticated = !!user
    const isLoading = isPending

    const logout = async () => {
        try {
            await signOut({
                fetchOptions: {
                    onSuccess: () => {
                        // Use window.location for full page reload to ensure cookies are cleared
                        window.location.href = "/"
                    }
                }
            })
        } catch (error) {
            console.error("Logout failed:", error)
            // Even if signOut fails, redirect to home
            window.location.href = "/"
        }
    }

    return {
        user,
        isAuthenticated,
        isLoading,
        logout,
        session: session || null,
        error
    }
}
