import { useMyProfile } from "@/queries/userQueries";
import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Save,
  DollarSign,
  Wallet,
  CreditCard,
  Receipt,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useUpdateProfile } from "@/services/users/useUpdateProfile";
import { toast } from "sonner";
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

export default function SettingsPage() {
  const { user: sessionUser } = useAuth();
  const { data: profileData, isLoading, error } = useMyProfile();
  const { updateProfile, isUpdating } = useUpdateProfile();
  const [activeTab, setActiveTab] = useState<
    "profile" | "notifications" | "security" | "earnings" | "withdrawals" | "billing-payments" | "transactions"
  >("profile");

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
                    onClick={() => setActiveTab("notifications")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === "notifications"
                        ? "bg-red-50 text-red-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Bell className="h-5 w-5" />
                    Notifications
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

              {/* Notifications Settings */}
              {activeTab === "notifications" && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Notification Settings
                  </h2>
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Notification settings will be available soon. We're
                      working on implementing email and push notification
                      preferences.
                    </p>
                  </div>
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
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Password
                          </h3>
                          <p className="text-sm text-gray-500">
                            Change your account password
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Change Password
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Two-Factor Authentication
                          </h3>
                          <p className="text-sm text-gray-500">Disabled</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Enable 2FA
                        </Button>
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
