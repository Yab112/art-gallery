import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AuthLayoutProps {
  children: ReactNode;
  onClose?: () => void;
}

export function AuthLayout({ children, onClose }: AuthLayoutProps) {
  const navigate = useNavigate();

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    navigate("/");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-6xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex min-h-[600px]">
          {/* Left side - Gradient background with organic shapes */}
          <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-500 to-orange-300"></div>

            {/* Organic curved shapes */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-transparent rounded-full transform -translate-x-32 -translate-y-32"></div>
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-orange-400/30 to-transparent rounded-full transform translate-x-24 translate-y-24"></div>
              <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-300/20 to-transparent rounded-full transform -translate-y-1/2"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex items-center justify-center p-12 w-full">
              <div className="text-center text-white space-y-8">
                {/* Main Logo */}
                <div className="w-12 h-12 mx-auto">
                  <img src="/mainlogo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>

                {/* Welcome text */}
                <div className="space-y-4">
                  <h1 className="text-6xl font-bold leading-tight tracking-tight">
                    Welcome
                    <br />
                    Back!
                  </h1>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Auth forms */}
          <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 relative">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="absolute top-4 right-4 z-10"
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="w-full max-w-md">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
