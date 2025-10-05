import { useState } from "react";
import {
  User,
  LogOut,
  Settings,
  Heart,
  ShoppingBag,
  UserPlus,
  LogIn,
} from "lucide-react";
import { Button } from "./ui/button";
import { SigninForm } from "./auth/signin-form";
import { SignupForm } from "./auth/signup-form";
import { AuthLayout } from "./auth/auth-layout";

interface UserDropdownProps {
  isLoggedIn?: boolean;
  onLogin?: () => void;
  onLogout?: () => void;
}

export function UserDropdown({
  isLoggedIn = false,
  onLogin,
  onLogout,
}: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authView, setAuthView] = useState<"signin" | "signup">("signin");

  const handleAuthSwitch = (view: "signin" | "signup") => {
    setAuthView(view);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
    setIsOpen(false);
  };

  const handleLogin = () => {
    onLogin?.();
    setShowAuth(false);
    setIsOpen(false);
  };

  const handleLogout = () => {
    onLogout?.();
    setIsOpen(false);
  };

  if (showAuth) {
    return (
      <AuthLayout onClose={handleCloseAuth}>
        {authView === "signin" ? (
          <SigninForm
            onSwitchToSignup={() => handleAuthSwitch("signup")}
            onForgotPassword={() => {
              /* Handle forgot password */
              console.log("Forgot password clicked");
            }}
          />
        ) : (
          <SignupForm onSwitchToSignin={() => handleAuthSwitch("signin")} />
        )}
      </AuthLayout>
    );
  }

  return (
    <div className="relative">
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="relative hover:bg-gray-100"
      >
        <User className="h-5 w-5 cursor-pointer text-gray-600" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border z-50">
          <div className="py-2">
            {isLoggedIn ? (
              <>
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-red-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        John Doe
                      </p>
                      <p className="text-xs text-gray-500">john@example.com</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      setIsOpen(false);
                      console.log("Navigate to profile");
                    }}
                  >
                    <User className="h-4 w-4 mr-3 text-gray-500" />
                    Profile
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      setIsOpen(false);
                      console.log("Navigate to favorites");
                    }}
                  >
                    <Heart className="h-4 w-4 mr-3 text-gray-500" />
                    Favorites
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      setIsOpen(false);
                      console.log("Navigate to orders");
                    }}
                  >
                    <ShoppingBag className="h-4 w-4 mr-3 text-gray-500" />
                    My Orders
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      setIsOpen(false);
                      console.log("Navigate to settings");
                    }}
                  >
                    <Settings className="h-4 w-4 mr-3 text-gray-500" />
                    Settings
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-100 py-1">
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Not Logged In */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm text-gray-600">Welcome to Artalistic</p>
                </div>

                <div className="py-1">
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      setAuthView("signin");
                      setShowAuth(true);
                      setIsOpen(false);
                    }}
                  >
                    <LogIn className="h-4 w-4 mr-3 text-gray-500" />
                    Sign In
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      setAuthView("signup");
                      setShowAuth(true);
                      setIsOpen(false);
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-3 text-gray-500" />
                    Create Account
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
