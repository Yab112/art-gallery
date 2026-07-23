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
import { useSearchParams } from "react-router-dom"
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
    const [searchParams] = useSearchParams()
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

    useEffect(() => {
        const tab = searchParams.get("tab")
        const allowed = new Set([
            "profile",
            "security",
            "earnings",
            "withdrawals",
            "billing-payments",
            "payment-method",
            "transactions",
        ])
        if (tab && allowed.has(tab)) {
            setActiveTab(tab as typeof activeTab)
        }
    }, [searchParams])

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
            <div className="h-screen overflow-hidden bg-white flex flex-col">
                <div className="container mx-auto max-w-5xl px-4 flex flex-col flex-1 min-h-0">
                    {/* Header */}
                    <div className="pt-10 mb-8 pb-6 border-b border-zinc-100 flex items-center justify-between flex-shrink-0">
                        <div>
                            <h1 className="font-bold text-2xl text-zinc-900 tracking-tight uppercase">Settings</h1>
                            <p className="text-zinc-500 text-xs mt-1">
                                Manage your account settings and preferences
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-12 md:grid-cols-12 flex-1 min-h-0">
                        {/* Sidebar Navigation */}
                        <div className="md:col-span-3 md:sticky md:top-24 self-start">
                            <div className="bg-transparent p-0">
                                <nav className="space-y-1">
                                    <div className="px-3 py-1.5 font-bold text-zinc-400 text-[11px] uppercase tracking-wider">
                                        General
                                    </div>
                                    <button
                                        onClick={() => setActiveTab("profile")}
                                        className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-left transition-all border-l-2 ${activeTab === "profile"
                                                ? "border-black text-zinc-900 bg-zinc-50/80"
                                                : "border-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50/40"
                                            }`}
                                    >
                                        <User className="h-4 w-4" />
                                        Profile
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("security")}
                                        className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-left transition-all border-l-2 ${activeTab === "security"
                                                ? "border-black text-zinc-900 bg-zinc-50/80"
                                                : "border-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50/40"
                                            }`}
                                    >
                                        <Shield className="h-4 w-4" />
                                        Security
                                    </button>

                                    <div className="my-2 border-t border-zinc-100" />

                                    <div className="px-3 py-1.5 font-bold text-zinc-400 text-[11px] uppercase tracking-wider">
                                        Artist Dashboard
                                    </div>
                                    <button
                                        onClick={() => setActiveTab("earnings")}
                                        className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-left transition-all border-l-2 ${activeTab === "earnings"
                                                ? "border-black text-zinc-900 bg-zinc-50/80"
                                                : "border-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50/40"
                                            }`}
                                    >
                                        <DollarSign className="h-4 w-4" />
                                        Earnings
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("withdrawals")}
                                        className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-left transition-all border-l-2 ${activeTab === "withdrawals"
                                                ? "border-black text-zinc-900 bg-zinc-50/80"
                                                : "border-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50/40"
                                            }`}
                                    >
                                        <Wallet className="h-4 w-4" />
                                        Withdrawals
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("billing-payments")}
                                        className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-left transition-all border-l-2 ${activeTab === "billing-payments"
                                                ? "border-black text-zinc-900 bg-zinc-50/80"
                                                : "border-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50/40"
                                            }`}
                                    >
                                        <CreditCard className="h-4 w-4" />
                                        Billing & Payments
                                    </button>

                                    <div className="my-2 border-t border-zinc-100" />

                                    <div className="px-3 py-1.5 font-bold text-zinc-400 text-[11px] uppercase tracking-wider">
                                        Transactions
                                    </div>
                                    <button
                                        onClick={() => setActiveTab("transactions")}
                                        className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-left transition-all border-l-2 ${activeTab === "transactions"
                                                ? "border-black text-zinc-900 bg-zinc-50/80"
                                                : "border-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50/40"
                                            }`}
                                    >
                                        <Receipt className="h-4 w-4" />
                                        Transactions
                                    </button>
                                </nav>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="md:col-span-9 md:overflow-y-auto md:h-full pb-12 custom-scrollbar">
                            {/* Profile Settings */}
                            {activeTab === "profile" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="font-bold text-zinc-900 text-lg uppercase tracking-wider">
                                            Profile Settings
                                        </h2>
                                        <p className="text-zinc-500 text-xs mt-1">
                                            Update your personal details and public profile information
                                        </p>
                                    </div>
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
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
                                                className="flex items-center gap-2 bg-black text-white hover:bg-zinc-800 transition-all rounded-lg text-xs py-2 px-4"
                                            >
                                                <Save className="h-3.5 w-3.5" />
                                                {isUpdating ? "Saving..." : "Save Changes"}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Security Settings */}
                            {activeTab === "security" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="font-bold text-zinc-900 text-lg uppercase tracking-wider">
                                            Security Settings
                                        </h2>
                                        <p className="text-zinc-500 text-xs mt-1">
                                            Secure your account by updating your credentials and password
                                        </p>
                                    </div>
                                    <div className="space-y-6 max-w-xl">
                                        {passwordError && (
                                            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                                                <p className="font-medium text-zinc-700 text-sm">
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
                                                    className="flex items-center gap-2 bg-black text-white hover:bg-zinc-800 transition-all rounded-lg text-xs py-2 px-4"
                                                >
                                                    <Save className="h-3.5 w-3.5" />
                                                    {isChangingPassword
                                                        ? "Changing..."
                                                        : "Change Password"}
                                                </Button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {/* Earnings Dashboard */}
                            {activeTab === "earnings" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="font-bold text-zinc-900 text-lg uppercase tracking-wider">
                                            Earnings Dashboard
                                        </h2>
                                        <p className="text-zinc-500 text-xs mt-1">
                                            Track your artist sales, platform earnings, and available payout balances
                                        </p>
                                    </div>
                                    <EarningsDashboard />
                                </div>
                            )}

                            {/* Withdrawals */}
                            {activeTab === "withdrawals" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="font-bold text-zinc-900 text-lg uppercase tracking-wider">
                                            Withdrawals
                                        </h2>
                                        <p className="text-zinc-500 text-xs mt-1">
                                            Request custom payouts and track your pending and historic withdrawals
                                        </p>
                                    </div>
                                    <WithdrawalSection />
                                </div>
                            )}

                            {/* Billing & Payments */}
                            {activeTab === "billing-payments" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="font-bold text-zinc-900 text-lg uppercase tracking-wider">
                                            Billing & Payments
                                        </h2>
                                        <p className="text-zinc-500 text-xs mt-1">
                                            Configure and manage your payout method preferences for withdrawals
                                        </p>
                                    </div>
                                    <BillingPaymentsSection />
                                </div>
                            )}

                            {/* Payment Method (Withdrawal Methods) */}
                            {activeTab === "payment-method" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="font-bold text-zinc-900 text-lg uppercase tracking-wider">
                                            Payment Method
                                        </h2>
                                        <p className="text-zinc-500 text-xs mt-1">
                                            Configure your payout method preferences
                                        </p>
                                    </div>
                                    <PaymentMethodSection />
                                </div>
                            )}

                            {/* Transactions */}
                            {activeTab === "transactions" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="font-bold text-zinc-900 text-lg uppercase tracking-wider">
                                            Transactions
                                        </h2>
                                        <p className="text-zinc-500 text-xs mt-1">
                                            View a full history of all credit and debit transactions
                                        </p>
                                    </div>
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
