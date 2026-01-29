import { useState, useEffect } from "react";
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
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";

interface UserDropdownProps {
  onLogin?: () => void;
  onLogout?: () => void;
}

export function UserDropdown({ onLogin, onLogout }: UserDropdownProps) {
  // Use custom auth hook for easier access
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const isLoggedIn = isAuthenticated;
  const [isOpen, setIsOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authView, setAuthView] = useState<"signin" | "signup">("signin");
  const [imageError, setImageError] = useState(false);

  // Reset image error when user or image changes
  useEffect(() => {
    if (user?.image) {
      setImageError(false);
    }
  }, [user?.image, user?.id]);

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

  const handleLogout = async () => {
    try {
      await logout();
      onLogout?.();
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  if (showAuth) {
    return (
      <AuthLayout onClose={handleCloseAuth}>
        {authView === "signin" ? (
          <SigninForm
            onSwitchToSignup={() => handleAuthSwitch("signup")}
            onForgotPassword={() => {
              setShowAuth(false);
              setIsOpen(false);
              navigate("/forgot-password", { replace: true });
            }}
          />
        ) : (
          <SignupForm onSwitchToSignin={() => handleAuthSwitch("signin")} />
        )}
      </AuthLayout>
    );
  }

  return (
    <div className="relative z-50">
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="relative hover:bg-gray-100 p-0 h-8 w-8 rounded-full overflow-hidden"
        disabled={isLoading}
        aria-label={user?.name || "User menu"}
      >
        {isLoading ? (
          <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
        ) : isLoggedIn && user?.image && user.image.trim() !== "" && !imageError ? (
          <img
            src={user.image}
            alt=""
            className="h-8 w-8 rounded-full object-cover border-2 border-gray-200 w-full h-full"
            onError={() => setImageError(true)}
            onLoad={() => setImageError(false)}
          />
        ) : isLoggedIn && user ? (
          <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center shrink-0 w-full h-full">
            <span className="text-sm font-semibold text-red-700 leading-none">
              {(user.name || user.email || "U")[0].toUpperCase()}
            </span>
          </div>
        ) : (
          <User className="h-5 w-5 cursor-pointer text-gray-600" />
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border z-[100]">
          <div className="py-2">
            {isLoggedIn ? (
              <>
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    {user?.image && !imageError ? (
                      <img
                        src={user.image}
                        alt={user.name || "User"}
                        className="w-8 h-8 aspect-square rounded-full object-cover object-center border-2 border-white"
                        style={{
                          borderRadius: "50%",
                          width: "2rem",
                          height: "2rem",
                          objectFit: "cover",
                        }}
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-red-700">
                          {(user?.name || user?.email || "U")[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user?.email || ""}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/profile");
                    }}
                  >
                    <User className="h-4 w-4 mr-3 text-gray-500" />
                    Profile
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/favorites");
                    }}
                  >
                    <Heart className="h-4 w-4 mr-3 text-gray-500" />
                    Favorites
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/orders");
                    }}
                  >
                    <ShoppingBag className="h-4 w-4 mr-3 text-gray-500" />
                    My Orders
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/settings");
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
                  <p className="text-sm text-gray-600">Welcome to Artopia</p>
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
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors border-t border-gray-100 mt-1 pt-2"
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/buyart");
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
      {isOpen && (
        <div className="fixed inset-0 z-[90]" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
