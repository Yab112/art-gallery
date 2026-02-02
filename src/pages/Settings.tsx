import { ProtectedRoute } from "@/components/auth/protected-route"
import { BillingPaymentsSection } from "@/components/settings/BillingPaymentsSection"
import { EarningsDashboard } from "@/components/settings/EarningsDashboard"
import { PaymentMethodSection } from "@/components/settings/PaymentMethodSection"
import { TransactionsSection } from "@/components/settings/TransactionsSection"
import { WithdrawalSection } from "@/components/settings/WithdrawalSection"
import { SettingsSkeleton } from "@/components/skeletons/settings-skeleton"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"
import { changePassword } from "@/lib/auth"
import { useMyProfile } from "@/queries/userQueries"
import { useUpdateProfile } from "@/services/users/useUpdateProfile"
import {
    CreditCard,
    DollarSign,
    Eye,
    EyeOff,
    Receipt,
    Save,
    Settings as SettingsIcon,
    Shield,
    User,
    Wallet
} from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

interface SettingsFormData {
    name: string
    email: string
}

interface ChangePasswordFormData {
    currentPassword: string
    newPassword: string
    confirmPassword: string
}

export default function SettingsPage() {
    const { user: sessionUser } = useAuth()
    const { data: profileData, isLoading, error } = useMyProfile()
    const { updateProfile, isUpdating } = useUpdateProfile()
    const [activeTab, setActiveTab] = useState<
        | "profile"
        | "security"
        | "earnings"
        | "withdrawals"
        | "billing-payments"
        | "payment-method"
        | "transactions"
    >("profile")
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [passwordError, setPasswordError] = useState<string | null>(null)

    const profile = profileData?.profile || sessionUser

    const form = useForm<SettingsFormData>({
        defaultValues: {
            name: profile?.name || "",
            email: profile?.email || ""
        }
    })

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = form

    const passwordForm = useForm<ChangePasswordFormData>({
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        }
    })

    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        formState: { errors: passwordErrors },
        reset: resetPassword,
        watch
    } = passwordForm

    const newPassword = watch("newPassword")

    // Update form when profile data loads
    useEffect(() => {
        if (profile) {
            reset({
                name: profile.name || "",
                email: profile.email || ""
            })
        }
    }, [profile, reset])

    const onSubmit = async (data: SettingsFormData) => {
        try {
            // Exclude email from the update payload as the backend doesn't allow it in profile updates
            const { email: _, ...updateData } = data
            await updateProfile(updateData)
            toast.success("Profile updated successfully")
        } catch (error: any) {
            toast.error(`Failed to update profile: ${error?.message || "An error occurred"}`)
        }
    }

    const onPasswordSubmit = async (data: ChangePasswordFormData) => {
        // Clear any previous errors
        setPasswordError(null)

        if (data.newPassword !== data.confirmPassword) {
            const errorMsg = "New passwords do not match"
            setPasswordError(errorMsg)
            toast.error(errorMsg)
            return
        }

        if (data.currentPassword === data.newPassword) {
            const errorMsg = "New password must be different from current password"
            setPasswordError(errorMsg)
            toast.error(errorMsg)
            return
        }

        setIsChangingPassword(true)
        try {
            await changePassword(
                {
                    currentPassword: data.currentPassword,
                    newPassword: data.newPassword,
                    revokeOtherSessions: true
                },
                {
                    onSuccess: () => {
                        toast.success("Password changed successfully")
                        resetPassword()
                        setPasswordError(null)
                        setIsChangingPassword(false)
                    },
                    onError: (ctx) => {
                        // Better Auth returns error in ctx.error
                        const error = ctx.error
                        let errorMessage = "Failed to change password. Please try again."

                        if (error) {
                            // Check for specific error codes
                            if (error.code === "INVALID_PASSWORD") {
                                errorMessage =
                                    "The current password you entered is incorrect. If you signed up with Google, you don't have a password yet. Use 'Forgot Password' to set one first."
                            } else if (error.message) {
                                errorMessage = error.message
                            } else if (error.code) {
                                errorMessage = `Error: ${error.code}`
                            }
                        }

                        setPasswordError(errorMessage)
                        toast.error(errorMessage)
                        setIsChangingPassword(false)
                    }
                }
            )
        } catch (error: any) {
            const errorMsg = error?.message || "Failed to change password"
            setPasswordError(errorMsg)
            toast.error(errorMsg)
            setIsChangingPassword(false)
        }
    }

    if (isLoading) {
        return (
            <ProtectedRoute>
                <SettingsSkeleton />
            </ProtectedRoute>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <EmptyState
                    icon={SettingsIcon}
                    title="Error Loading Settings"
                    description="Failed to load your settings. Please try again later."
                />
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="container mx-auto px-4 py-8">
                <EmptyState
                    icon={SettingsIcon}
                    title="Profile Not Found"
                    description="We couldn't find your profile information."
                />
            </div>
        )
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto max-w-6xl px-4 py-8">
                    {/* Header */}
                    <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm">
                        <div className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                    <SettingsIcon className="h-6 w-6 text-gray-700" />
                                </div>
                                <div>
                                    <h1 className="font-bold text-3xl text-gray-900">Settings</h1>
                                    <p className="mt-1 text-gray-500">
                                        Manage your account settings and preferences
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                        {/* Sidebar Navigation */}
                        <div className="md:col-span-1">
                            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                                <nav className="space-y-2">
                                    <div className="px-4 py-2 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                                        General
                                    </div>
                                    <button
                                        onClick={() => setActiveTab("profile")}
                                        className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                                            activeTab === "profile"
                                                ? "bg-red-50 font-medium text-red-700"
                                                : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                    >
                                        <User className="h-5 w-5" />
                                        Profile
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("security")}
                                        className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                                            activeTab === "security"
                                                ? "bg-red-50 font-medium text-red-700"
                                                : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                    >
                                        <Shield className="h-5 w-5" />
                                        Security
                                    </button>

                                    <div className="my-3 border-t" />

                                    <div className="px-4 py-2 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                                        Artist Dashboard
                                    </div>
                                    <button
                                        onClick={() => setActiveTab("earnings")}
                                        className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                                            activeTab === "earnings"
                                                ? "bg-red-50 font-medium text-red-700"
                                                : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                    >
                                        <DollarSign className="h-5 w-5" />
                                        Earnings
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("withdrawals")}
                                        className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                                            activeTab === "withdrawals"
                                                ? "bg-red-50 font-medium text-red-700"
                                                : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                    >
                                        <Wallet className="h-5 w-5" />
                                        Withdrawals
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("billing-payments")}
                                        className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                                            activeTab === "billing-payments"
                                                ? "bg-red-50 font-medium text-red-700"
                                                : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                    >
                                        <CreditCard className="h-5 w-5" />
                                        Billing & Payments
                                    </button>

                                    <div className="my-3 border-t" />

                                    <div className="px-4 py-2 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                                        Transactions
                                    </div>
                                    <button
                                        onClick={() => setActiveTab("transactions")}
                                        className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                                            activeTab === "transactions"
                                                ? "bg-red-50 font-medium text-red-700"
                                                : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                    >
                                        <Receipt className="h-5 w-5" />
                                        Transactions
                                    </button>
                                </nav>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="md:col-span-3">
                            {/* Profile Settings */}
                            {activeTab === "profile" && (
                                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                                    <h2 className="mb-6 font-semibold text-gray-900 text-xl">
                                        Profile Settings
                                    </h2>
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input
                                                id="name"
                                                {...register("name", {
                                                    required: "Name is required"
                                                })}
                                                placeholder="Your full name"
                                            />
                                            {errors.name && (
                                                <p className="text-red-500 text-sm">
                                                    {errors.name.message}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                {...register("email")}
                                                placeholder="your.email@example.com"
                                                disabled
                                                className="cursor-not-allowed bg-gray-50"
                                            />
                                            <p className="text-muted-foreground text-xs">
                                                Email address cannot be changed directly.
                                            </p>
                                            {errors.email && (
                                                <p className="text-red-500 text-sm">
                                                    {errors.email.message}
                                                </p>
                                            )}
                                            {profile.emailVerified ? (
                                                <p className="text-green-600 text-xs">
                                                    ✓ Email verified
                                                </p>
                                            ) : (
                                                <p className="text-xs text-yellow-600">
                                                    ⚠ Email not verified
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <Button
                                                type="submit"
                                                disabled={isUpdating}
                                                className="flex items-center gap-2 bg-red-700 text-white hover:bg-red-800"
                                            >
                                                <Save className="h-4 w-4" />
                                                {isUpdating ? "Saving..." : "Save Changes"}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Security Settings */}
                            {activeTab === "security" && (
                                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                                    <h2 className="mb-6 font-semibold text-gray-900 text-xl">
                                        Security Settings
                                    </h2>
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="rounded-lg border border-gray-200 p-4">
                                                <div className="mb-4">
                                                    <h3 className="mb-1 font-medium text-gray-900">
                                                        Change Password
                                                    </h3>
                                                    <p className="text-gray-500 text-sm">
                                                        Update your account password to keep your
                                                        account secure
                                                    </p>
                                                    <p className="mt-1 text-gray-400 text-xs">
                                                        Note: If you signed up with Google, you'll
                                                        need to use "Forgot Password" first to set a
                                                        password.
                                                    </p>
                                                </div>
                                                {passwordError && (
                                                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
                                                        <p className="font-medium text-red-700 text-sm">
                                                            {passwordError}
                                                        </p>
                                                    </div>
                                                )}
                                                <form
                                                    onSubmit={handlePasswordSubmit(
                                                        onPasswordSubmit
                                                    )}
                                                    className="space-y-4"
                                                >
                                                    <div className="space-y-2">
                                                        <Label htmlFor="currentPassword">
                                                            Current Password
                                                        </Label>
                                                        <div className="relative">
                                                            <Input
                                                                id="currentPassword"
                                                                type={
                                                                    showCurrentPassword
                                                                        ? "text"
                                                                        : "password"
                                                                }
                                                                {...registerPassword(
                                                                    "currentPassword",
                                                                    {
                                                                        required:
                                                                            "Current password is required"
                                                                    }
                                                                )}
                                                                placeholder="Enter your current password"
                                                                className="pr-10"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setShowCurrentPassword(
                                                                        !showCurrentPassword
                                                                    )
                                                                }
                                                                className="-translate-y-1/2 absolute top-1/2 right-3 text-gray-500 hover:text-gray-700"
                                                            >
                                                                {showCurrentPassword ? (
                                                                    <EyeOff className="h-4 w-4" />
                                                                ) : (
                                                                    <Eye className="h-4 w-4" />
                                                                )}
                                                            </button>
                                                        </div>
                                                        {passwordErrors.currentPassword && (
                                                            <p className="text-red-500 text-sm">
                                                                {
                                                                    passwordErrors.currentPassword
                                                                        .message
                                                                }
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="newPassword">
                                                            New Password
                                                        </Label>
                                                        <div className="relative">
                                                            <Input
                                                                id="newPassword"
                                                                type={
                                                                    showNewPassword
                                                                        ? "text"
                                                                        : "password"
                                                                }
                                                                {...registerPassword(
                                                                    "newPassword",
                                                                    {
                                                                        required:
                                                                            "New password is required",
                                                                        minLength: {
                                                                            value: 8,
                                                                            message:
                                                                                "Password must be at least 8 characters"
                                                                        },
                                                                        maxLength: {
                                                                            value: 128,
                                                                            message:
                                                                                "Password must be less than 128 characters"
                                                                        }
                                                                    }
                                                                )}
                                                                placeholder="Enter your new password"
                                                                className="pr-10"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setShowNewPassword(
                                                                        !showNewPassword
                                                                    )
                                                                }
                                                                className="-translate-y-1/2 absolute top-1/2 right-3 text-gray-500 hover:text-gray-700"
                                                            >
                                                                {showNewPassword ? (
                                                                    <EyeOff className="h-4 w-4" />
                                                                ) : (
                                                                    <Eye className="h-4 w-4" />
                                                                )}
                                                            </button>
                                                        </div>
                                                        {passwordErrors.newPassword && (
                                                            <p className="text-red-500 text-sm">
                                                                {passwordErrors.newPassword.message}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="confirmPassword">
                                                            Confirm New Password
                                                        </Label>
                                                        <div className="relative">
                                                            <Input
                                                                id="confirmPassword"
                                                                type={
                                                                    showConfirmPassword
                                                                        ? "text"
                                                                        : "password"
                                                                }
                                                                {...registerPassword(
                                                                    "confirmPassword",
                                                                    {
                                                                        required:
                                                                            "Please confirm your new password",
                                                                        validate: (value) =>
                                                                            value === newPassword ||
                                                                            "Passwords do not match"
                                                                    }
                                                                )}
                                                                placeholder="Confirm your new password"
                                                                className="pr-10"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setShowConfirmPassword(
                                                                        !showConfirmPassword
                                                                    )
                                                                }
                                                                className="-translate-y-1/2 absolute top-1/2 right-3 text-gray-500 hover:text-gray-700"
                                                            >
                                                                {showConfirmPassword ? (
                                                                    <EyeOff className="h-4 w-4" />
                                                                ) : (
                                                                    <Eye className="h-4 w-4" />
                                                                )}
                                                            </button>
                                                        </div>
                                                        {passwordErrors.confirmPassword && (
                                                            <p className="text-red-500 text-sm">
                                                                {
                                                                    passwordErrors.confirmPassword
                                                                        .message
                                                                }
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="flex justify-end pt-2">
                                                        <Button
                                                            type="submit"
                                                            disabled={isChangingPassword}
                                                            className="flex items-center gap-2 bg-red-700 text-white hover:bg-red-800"
                                                        >
                                                            <Save className="h-4 w-4" />
                                                            {isChangingPassword
                                                                ? "Changing..."
                                                                : "Change Password"}
                                                        </Button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Earnings Dashboard */}
                            {activeTab === "earnings" && (
                                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                                    <h2 className="mb-6 font-semibold text-gray-900 text-xl">
                                        Earnings Dashboard
                                    </h2>
                                    <EarningsDashboard />
                                </div>
                            )}

                            {/* Withdrawals */}
                            {activeTab === "withdrawals" && (
                                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                                    <h2 className="mb-6 font-semibold text-gray-900 text-xl">
                                        Withdrawals
                                    </h2>
                                    <WithdrawalSection />
                                </div>
                            )}

                            {/* Billing & Payments */}
                            {activeTab === "billing-payments" && (
                                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                                    <h2 className="mb-6 font-semibold text-gray-900 text-xl">
                                        Billing & Payments
                                    </h2>
                                    <BillingPaymentsSection />
                                </div>
                            )}

                            {/* Payment Method (Withdrawal Methods) */}
                            {activeTab === "payment-method" && (
                                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                                    <h2 className="mb-6 font-semibold text-gray-900 text-xl">
                                        Payment Method
                                    </h2>
                                    <PaymentMethodSection />
                                </div>
                            )}

                            {/* Transactions */}
                            {activeTab === "transactions" && (
                                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                                    <h2 className="mb-6 font-semibold text-gray-900 text-xl">
                                        Transactions
                                    </h2>
                                    <TransactionsSection />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}
