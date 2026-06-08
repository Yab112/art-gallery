import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn, signInWithGoogle } from "@/lib/auth"
import { captureAuthTokenFromResponse } from "@/lib/bearer-token"
import {
    completeAuthRedirect,
    storeAuthRedirect,
} from "@/lib/auth-redirect"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"

interface SigninFormData {
    email: string
    password: string
    rememberMe: boolean
}

interface AuthNavigationProps {
    onSwitchToSignup: () => void
    onForgotPassword: () => void
    redirectTo?: string
}

export function SigninForm({
    onSwitchToSignup,
    onForgotPassword,
    redirectTo = "/",
}: AuthNavigationProps) {
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isSocialLoading, setIsSocialLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const form = useForm<SigninFormData>({
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false
        }
    })

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = form

    const navigate = useNavigate()

    // Handler for Google sign-in
    const handleGoogleSignIn = async () => {
        setIsSocialLoading(true)
        setError(null)
        try {
            storeAuthRedirect(redirectTo)
            await signInWithGoogle()
        } catch (err: any) {
            setError(err?.message || "Failed to sign in with Google")
            setIsSocialLoading(false)
        }
    }

    const onSubmit = async (data: SigninFormData) => {
        setIsLoading(true)
        setError(null)

        try {
            // Use Better Auth signIn with proper error handling
            await signIn.email(
                {
                    email: data.email,
                    password: data.password,
                    rememberMe: data.rememberMe
                },
                {
                    onSuccess: async (ctx) => {
                        captureAuthTokenFromResponse(ctx.response)
                        reset()
                        await completeAuthRedirect(redirectTo)
                    },
                    onError: (ctx) => {
                        // Check if error is due to unverified email (status 403)
                        // Better Auth returns 403 when requireEmailVerification is true and email is not verified
                        if (
                            ctx.error?.status === 403 ||
                            ctx.error?.message?.toLowerCase().includes("verify") ||
                            ctx.error?.message?.toLowerCase().includes("verification")
                        ) {
                            // Redirect to verify email page with the email parameter
                            window.location.href = `/verify-email?email=${encodeURIComponent(
                                data.email
                            )}`
                            setIsLoading(false)
                            return
                        }

                        setError(ctx.error?.message || "Failed to sign in. Please try again.")
                        setIsLoading(false)
                    }
                }
            )
        } catch (err: any) {
            // Also check catch block for verification errors
            const errorMessage = err?.message || "An error occurred. Please try again."
            if (
                err?.status === 403 ||
                errorMessage.toLowerCase().includes("verify") ||
                errorMessage.toLowerCase().includes("verification")
            ) {
                navigate(`/verify-email?email=${encodeURIComponent(data.email)}`)
                setIsLoading(false)
                return
            }

            setError(errorMessage)
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full space-y-8">
            <div className="space-y-3 text-left">
                <h1 className="font-serif text-4xl text-gray-900 tracking-tight">Sign In</h1>
                <p className="font-medium text-gray-500 text-sm">
                    Access your curated collection and favorite artists.
                </p>
            </div>

            {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="email" className="font-semibold text-gray-700 text-xs uppercase tracking-widest">
                        Email Address
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="e.g. curator@arthopia.com"
                        {...register("email", { required: "Email is required" })}
                        className={`h-12 border-gray-200 bg-white px-4 transition-all focus:border-gray-900 focus:ring-0 ${
                            errors.email ? "border-red-500" : ""
                        }`}
                    />
                    {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="font-semibold text-gray-700 text-xs uppercase tracking-widest">
                            Password
                        </Label>
                        <button
                            type="button"
                            onClick={onForgotPassword}
                            className="font-medium text-red-700 text-xs hover:text-red-800"
                        >
                            Forgot?
                        </button>
                    </div>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...register("password", { required: "Password is required" })}
                            className={`h-12 border-gray-200 bg-white px-4 pr-10 transition-all focus:border-gray-900 focus:ring-0 ${
                                errors.password ? "border-red-500" : ""
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="-translate-y-1/2 absolute top-1/2 right-3 transform text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-red-500 text-xs">{errors.password.message}</p>
                    )}
                </div>

                <div className="flex items-center space-x-2 py-1">
                    <Checkbox
                        id="remember"
                        checked={form.watch("rememberMe")}
                        onCheckedChange={(checked) => form.setValue("rememberMe", checked)}
                        className="border-gray-300 data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900"
                    />
                    <Label htmlFor="remember" className="text-gray-500 text-xs font-medium">
                        Remember this device
                    </Label>
                </div>

                <Button
                    type="submit"
                    className="h-12 w-full rounded-none bg-gray-900 font-bold text-white tracking-widest uppercase text-xs transition-all hover:bg-black"
                    disabled={isLoading || isSocialLoading}
                >
                    {isLoading ? "Signing in..." : "Sign In"}
                </Button>
            </form>

            {/* Social Login Divider */}
            <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-gray-100 border-t" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em]">
                    <span className="bg-white px-4 text-gray-400">Or continue with</span>
                </div>
            </div>

            {/* Social Login Buttons */}
            <div className="flex justify-center">
                <Button
                    type="button"
                    variant="outline"
                    className="h-12 w-full rounded-none border-gray-200 bg-white font-semibold text-gray-700 text-xs transition-all hover:bg-gray-50"
                    disabled={isLoading || isSocialLoading}
                    onClick={handleGoogleSignIn}
                >
                    <svg className="mr-3 h-4 w-4" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    Google
                </Button>
            </div>

            <div className="space-y-4 pt-4 text-center">
                <p className="text-gray-500 text-xs">
                    Don't have an account?{" "}
                    <button
                        type="button"
                        onClick={onSwitchToSignup}
                        className="font-bold text-gray-900 underline underline-offset-4 hover:text-red-700"
                    >
                        Create One
                    </button>
                </p>
                <button
                    type="button"
                    onClick={() => navigate("/buyart")}
                    className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600"
                >
                    Explore as guest
                </button>
            </div>
        </div>
    )
}
