import { useAuth } from "@/hooks/use-auth"
import { Heart, LogIn, LogOut, Settings, ShoppingBag, User, UserPlus } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AuthLayout } from "./auth/auth-layout"
import { SigninForm } from "./auth/signin-form"
import { SignupForm } from "./auth/signup-form"
import { Button } from "./ui/button"

interface UserDropdownProps {
    onLogin?: () => void
    onLogout?: () => void
}

export function UserDropdown({ onLogin, onLogout }: UserDropdownProps) {
    // Use custom auth hook for easier access
    const { user, isAuthenticated, isLoading, logout } = useAuth()
    const navigate = useNavigate()
    const isLoggedIn = isAuthenticated
    const [isOpen, setIsOpen] = useState(false)
    const [showAuth, setShowAuth] = useState(false)
    const [authView, setAuthView] = useState<"signin" | "signup">("signin")
    const [imageError, setImageError] = useState(false)

    // Reset image error when user or image changes
    useEffect(() => {
        if (user?.image) {
            setImageError(false)
        }
    }, [user?.image, user?.id])

    const handleAuthSwitch = (view: "signin" | "signup") => {
        setAuthView(view)
    }

    const handleCloseAuth = () => {
        setShowAuth(false)
        setIsOpen(false)
    }

    const handleLogin = () => {
        onLogin?.()
        setShowAuth(false)
        setIsOpen(false)
    }

    const handleLogout = async () => {
        try {
            await logout()
            onLogout?.()
            setIsOpen(false)
        } catch (error) {
            console.error("Failed to sign out:", error)
        }
    }

    if (showAuth) {
        return (
            <AuthLayout onClose={handleCloseAuth}>
                {authView === "signin" ? (
                    <SigninForm
                        onSwitchToSignup={() => handleAuthSwitch("signup")}
                        onForgotPassword={() => {
                            setShowAuth(false)
                            setIsOpen(false)
                            navigate("/forgot-password", { replace: true })
                        }}
                    />
                ) : (
                    <SignupForm onSwitchToSignin={() => handleAuthSwitch("signin")} />
                )}
            </AuthLayout>
        )
    }

    return (
        <div className="relative z-50">
            <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsOpen(!isOpen)}
                className="relative h-8 w-8 overflow-hidden rounded-full p-0 hover:bg-gray-100"
                disabled={isLoading}
                aria-label={user?.name || "User menu"}
            >
                {isLoading ? (
                    <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
                ) : isLoggedIn && user?.image && user.image.trim() !== "" && !imageError ? (
                    <img
                        src={user.image}
                        alt=""
                        className="h-8 h-full w-8 w-full rounded-full border-2 border-gray-200 object-cover"
                        onError={() => setImageError(true)}
                        onLoad={() => setImageError(false)}
                    />
                ) : isLoggedIn && user ? (
                    <div className="flex h-8 h-full w-8 w-full shrink-0 items-center justify-center rounded-full bg-red-100">
                        <span className="font-semibold text-red-700 text-sm leading-none">
                            {(user.name || user.email || "U")[0].toUpperCase()}
                        </span>
                    </div>
                ) : (
                    <User className="h-5 w-5 cursor-pointer text-gray-600" />
                )}
            </Button>

            {isOpen && (
                <div className="absolute right-0 z-[100] mt-2 w-72 rounded-lg border bg-white shadow-xl">
                    <div className="py-2">
                        {isLoggedIn ? (
                            <>
                                {/* User Info */}
                                <div className="border-gray-100 border-b px-4 py-3">
                                    <div className="flex items-center space-x-3">
                                        {user?.image && !imageError ? (
                                            <img
                                                src={user.image}
                                                alt={user.name || "User"}
                                                className="aspect-square h-8 w-8 rounded-full border-2 border-white object-cover object-center"
                                                style={{
                                                    borderRadius: "50%",
                                                    width: "2rem",
                                                    height: "2rem",
                                                    objectFit: "cover"
                                                }}
                                                onError={() => setImageError(true)}
                                            />
                                        ) : (
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
                                                <span className="font-semibold text-red-700 text-xs">
                                                    {(user?.name ||
                                                        user?.email ||
                                                        "U")[0].toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">
                                                {user?.name || "User"}
                                            </p>
                                            <p className="text-gray-500 text-xs">
                                                {user?.email || ""}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div className="py-1">
                                    <button
                                        className="flex w-full items-center px-4 py-2 text-gray-700 text-sm transition-colors hover:bg-gray-100"
                                        onClick={() => {
                                            setIsOpen(false)
                                            navigate("/profile")
                                        }}
                                    >
                                        <User className="mr-3 h-4 w-4 text-gray-500" />
                                        Profile
                                    </button>
                                    <button
                                        className="flex w-full items-center px-4 py-2 text-gray-700 text-sm transition-colors hover:bg-gray-100"
                                        onClick={() => {
                                            setIsOpen(false)
                                            navigate("/favorites")
                                        }}
                                    >
                                        <Heart className="mr-3 h-4 w-4 text-gray-500" />
                                        Favorites
                                    </button>
                                    <button
                                        className="flex w-full items-center px-4 py-2 text-gray-700 text-sm transition-colors hover:bg-gray-100"
                                        onClick={() => {
                                            setIsOpen(false)
                                            navigate("/orders")
                                        }}
                                    >
                                        <ShoppingBag className="mr-3 h-4 w-4 text-gray-500" />
                                        My Orders
                                    </button>
                                    <button
                                        className="flex w-full items-center px-4 py-2 text-gray-700 text-sm transition-colors hover:bg-gray-100"
                                        onClick={() => {
                                            setIsOpen(false)
                                            navigate("/settings")
                                        }}
                                    >
                                        <Settings className="mr-3 h-4 w-4 text-gray-500" />
                                        Settings
                                    </button>
                                </div>

                                {/* Logout */}
                                <div className="border-gray-100 border-t py-1">
                                    <button
                                        className="flex w-full items-center px-4 py-2 text-red-600 text-sm transition-colors hover:bg-red-50"
                                        onClick={handleLogout}
                                    >
                                        <LogOut className="mr-3 h-4 w-4" />
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Not Logged In */}
                                <div className="border-gray-100 border-b px-4 py-3">
                                    <p className="text-gray-600 text-sm">Welcome to Artopia</p>
                                </div>

                                <div className="py-1">
                                    <button
                                        className="flex w-full items-center px-4 py-2 text-gray-700 text-sm transition-colors hover:bg-gray-100"
                                        onClick={() => {
                                            setAuthView("signin")
                                            setShowAuth(true)
                                            setIsOpen(false)
                                        }}
                                    >
                                        <LogIn className="mr-3 h-4 w-4 text-gray-500" />
                                        Sign In
                                    </button>
                                    <button
                                        className="flex w-full items-center px-4 py-2 text-gray-700 text-sm transition-colors hover:bg-gray-100"
                                        onClick={() => {
                                            setAuthView("signup")
                                            setShowAuth(true)
                                            setIsOpen(false)
                                        }}
                                    >
                                        <UserPlus className="mr-3 h-4 w-4 text-gray-500" />
                                        Create Account
                                    </button>
                                    <button
                                        className="mt-1 flex w-full items-center border-gray-100 border-t px-4 py-2 pt-2 text-gray-500 text-sm transition-colors hover:bg-gray-50"
                                        onClick={() => {
                                            setIsOpen(false)
                                            navigate("/buyart")
                                        }}
                                    >
                                        Explore as guest
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Overlay to close dropdown when clicking outside */}
            {isOpen && <div className="fixed inset-0 z-[90]" onClick={() => setIsOpen(false)} />}
        </div>
    )
}
