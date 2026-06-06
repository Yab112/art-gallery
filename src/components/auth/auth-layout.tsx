import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { ReactNode } from "react";
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
      <div className="relative mx-4 max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex max-h-[90vh] min-h-[min(600px,85vh)]">
          {/* Left side - Gallery Paper Aesthetic */}
          <div className="relative hidden overflow-hidden lg:flex lg:w-1/2">
            {/* Warm Stone / Art Paper Background */}
            <div className="absolute inset-0 bg-[#f9f8f6]" />

            {/* Subtle Canvas Texture Overlay */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: `url("https://www.transparenttextures.com/patterns/natural-paper.png")`,
              }}
            />

            {/* Content */}
            <div className="relative z-10 flex h-full w-full flex-col justify-between p-20">
              <div /> {/* Spacer */}
              {/* Sophisticated Editorial Typography */}
              <div className="space-y-12">
                <div className="space-y-2">
                  <span className="block font-bold text-red-600 text-[10px] uppercase tracking-[0.5em]">
                    The Collector's Portal
                  </span>
                  <div className="h-px w-12 bg-red-600" />
                </div>

                <h1 className="font-serif text-[5rem] leading-[0.9] text-gray-900 tracking-tighter">
                  Art <br />
                  <span className="italic font-light text-gray-400">
                    is
                  </span>{" "}
                  <br />
                  Infinite.
                </h1>

                <div className="max-w-xs space-y-4">
                  <p className="font-medium text-gray-500 text-sm leading-relaxed">
                    Your gateway to the world's most <br />
                    compelling contemporary works.
                  </p>
                  <p className="text-gray-400 text-[11px] leading-relaxed italic">
                    "Every artist dips his brush in his own soul, and paints his
                    own nature into his pictures."
                  </p>
                </div>
              </div>
              {/* Bottom Metadata */}
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <p className="font-black text-gray-900 text-[10px] uppercase tracking-widest">
                    Artopia Fine Art
                  </p>
                  <p className="text-gray-400 text-[9px] uppercase tracking-widest">
                    Curated Collective © 2026
                  </p>
                </div>
                <div className="font-serif text-4xl text-gray-100 select-none">
                  A.
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Auth forms */}
          <div className="relative flex flex-1 items-start justify-center overflow-y-auto bg-gray-50 p-8 pt-12">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="absolute top-4 right-4 z-10"
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="my-auto w-full max-w-md">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
