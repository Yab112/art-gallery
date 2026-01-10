import { useMyProfile } from "@/queries/userQueries";
import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Save,
  DollarSign,
  Wallet,
  CreditCard,
  Receipt,
  Eye,
  EyeOff,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useUpdateProfile } from "@/services/users/useUpdateProfile";
import { toast } from "sonner";
import { changePassword } from "@/lib/auth";
import { EarningsDashboard } from "@/components/settings/EarningsDashboard";
import { WithdrawalSection } from "@/components/settings/WithdrawalSection";
import { PaymentMethodSection } from "@/components/settings/PaymentMethodSection";
import { BillingPaymentsSection } from "@/components/settings/BillingPaymentsSection";
import { TransactionsSection } from "@/components/settings/TransactionsSection";
import { SettingsSkeleton } from "@/components/skeletons/settings-skeleton";

interface SettingsFormData {
  name: string;
  email: string;
}

interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function SettingsPage() {
  const { user: sessionUser } = useAuth();
  const { data: profileData, isLoading, error } = useMyProfile();
  const { updateProfile, isUpdating } = useUpdateProfile();
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "earnings" | "withdrawals" | "billing-payments" | "transactions"
  >("profile");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const profile = profileData?.profile || sessionUser;

  const form = useForm<SettingsFormData>({
    defaultValues: {
      name: profile?.name || "",
      email: profile?.email || "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = form;

  const passwordForm = useForm<ChangePasswordFormData>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch,
  } = passwordForm;

  const newPassword = watch("newPassword");

  // Update form when profile data loads
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || "",
        email: profile.email || "",
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: SettingsFormData) => {
    try {
      await updateProfile(data);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(
        "Failed to update profile: " + (error?.message || "An error occurred")
      );
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordFormData) => {
    // Clear any previous errors
    setPasswordError(null);
    
    if (data.newPassword !== data.confirmPassword) {
      const errorMsg = "New passwords do not match";
      setPasswordError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (data.currentPassword === data.newPassword) {
      const errorMsg = "New password must be different from current password";
      setPasswordError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        revokeOtherSessions: true,
      }, {
        onSuccess: () => {
          toast.success("Password changed successfully");
          resetPassword();
          setPasswordError(null);
          setIsChangingPassword(false);
        },
        onError: (ctx) => {
          // Better Auth returns error in ctx.error
          const error = ctx.error;
          let errorMessage = "Failed to change password. Please try again.";
          
          if (error) {
            // Check for specific error codes
            if (error.code === "INVALID_PASSWORD") {
              errorMessage = "The current password you entered is incorrect. If you signed up with Google, you don't have a password yet. Use 'Forgot Password' to set one first.";
            } else if (error.message) {
              errorMessage = error.message;
            } else if (error.code) {
              errorMessage = `Error: ${error.code}`;
            }
          }
          
          setPasswordError(errorMessage);
          toast.error(errorMessage);
          setIsChangingPassword(false);
        },
      });
    } catch (error: any) {
      const errorMsg = error?.message || "Failed to change password";
      setPasswordError(errorMsg);
      toast.error(errorMsg);
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <SettingsSkeleton />
      </ProtectedRoute>
    );
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
    );
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
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <SettingsIcon className="h-6 w-6 text-gray-700" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                  <p className="text-gray-500 mt-1">
                    Manage your account settings and preferences
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <nav className="space-y-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2">
                    General
                  </div>
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === "profile"
                        ? "bg-red-50 text-red-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <User className="h-5 w-5" />
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveTab("security")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === "security"
                        ? "bg-red-50 text-red-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Shield className="h-5 w-5" />
                    Security
                  </button>

                  <div className="border-t my-3"></div>

                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2">
                    Artist Dashboard
                  </div>
                  <button
                    onClick={() => setActiveTab("earnings")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === "earnings"
                        ? "bg-red-50 text-red-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <DollarSign className="h-5 w-5" />
                    Earnings
                  </button>
                  <button
                    onClick={() => setActiveTab("withdrawals")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === "withdrawals"
                        ? "bg-red-50 text-red-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Wallet className="h-5 w-5" />
                    Withdrawals
                  </button>
                  <button
                    onClick={() => setActiveTab("billing-payments")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === "billing-payments"
                        ? "bg-red-50 text-red-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <CreditCard className="h-5 w-5" />
                    Billing & Payments
                  </button>

                  <div className="border-t my-3"></div>

                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2">
                    Transactions
                  </div>
                  <button
                    onClick={() => setActiveTab("transactions")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === "transactions"
                        ? "bg-red-50 text-red-700 font-medium"
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
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Profile Settings
                  </h2>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        {...register("name", { required: "Name is required" })}
                        placeholder="Your full name"
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address",
                          },
                        })}
                        placeholder="your.email@example.com"
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500">
                          {errors.email.message}
                        </p>
                      )}
                      {profile.emailVerified ? (
                        <p className="text-xs text-green-600">
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
                        className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white"
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
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Security Settings
                  </h2>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="mb-4">
                          <h3 className="font-medium text-gray-900 mb-1">
                            Change Password
                          </h3>
                          <p className="text-sm text-gray-500">
                            Update your account password to keep your account secure
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Note: If you signed up with Google, you'll need to use "Forgot Password" first to set a password.
                          </p>
                        </div>
                        {passwordError && (
                          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700 font-medium">
                              {passwordError}
                            </p>
                          </div>
                        )}
                        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <div className="relative">
                              <Input
                                id="currentPassword"
                                type={showCurrentPassword ? "text" : "password"}
                                {...registerPassword("currentPassword", {
                                  required: "Current password is required",
                                })}
                                placeholder="Enter your current password"
                                className="pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                              >
                                {showCurrentPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                            {passwordErrors.currentPassword && (
                              <p className="text-sm text-red-500">
                                {passwordErrors.currentPassword.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <div className="relative">
                              <Input
                                id="newPassword"
                                type={showNewPassword ? "text" : "password"}
                                {...registerPassword("newPassword", {
                                  required: "New password is required",
                                  minLength: {
                                    value: 8,
                                    message: "Password must be at least 8 characters",
                                  },
                                  maxLength: {
                                    value: 128,
                                    message: "Password must be less than 128 characters",
                                  },
                                })}
                                placeholder="Enter your new password"
                                className="pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                              >
                                {showNewPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                            {passwordErrors.newPassword && (
                              <p className="text-sm text-red-500">
                                {passwordErrors.newPassword.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <div className="relative">
                              <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                {...registerPassword("confirmPassword", {
                                  required: "Please confirm your new password",
                                  validate: (value) =>
                                    value === newPassword || "Passwords do not match",
                                })}
                                placeholder="Confirm your new password"
                                className="pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                            {passwordErrors.confirmPassword && (
                              <p className="text-sm text-red-500">
                                {passwordErrors.confirmPassword.message}
                              </p>
                            )}
                          </div>

                          <div className="flex justify-end pt-2">
                            <Button
                              type="submit"
                              disabled={isChangingPassword}
                              className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white"
                            >
                              <Save className="h-4 w-4" />
                              {isChangingPassword ? "Changing..." : "Change Password"}
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
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Earnings Dashboard
                  </h2>
                  <EarningsDashboard />
                </div>
              )}

              {/* Withdrawals */}
              {activeTab === "withdrawals" && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Withdrawals
                  </h2>
                  <WithdrawalSection />
                </div>
              )}

              {/* Billing & Payments */}
              {activeTab === "billing-payments" && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Billing & Payments
                  </h2>
                  <BillingPaymentsSection />
                </div>
              )}

              {/* Payment Method (Withdrawal Methods) */}
              {activeTab === "payment-method" && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Payment Method
                  </h2>
                  <PaymentMethodSection />
                </div>
              )}

              {/* Transactions */}
              {activeTab === "transactions" && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
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
  );
}
