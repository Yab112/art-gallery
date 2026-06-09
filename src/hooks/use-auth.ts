import { completeLogout, signOut, useSession } from "@/lib/auth"
import type { User } from "@/lib/auth"

/**
 * Custom hook for authentication state and actions
 * Provides easy access to user session and auth methods
 */
export const useAuth = () => {
    const { data: session, isPending, error } = useSession()

    // Better Auth useSession returns { data: session, isPending, error }
    // session has { user, session } structure
    const user: User | null = session?.user || null
    const isAuthenticated = !!user
    const isLoading = isPending

    const logout = async () => {
        await signOut()
        completeLogout()
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
