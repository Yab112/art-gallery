import { Button } from "@/components/ui/button";
import { LucideIcon, Loader2 } from "lucide-react";
import { ReactNode } from "react";

interface MinimalButtonProps {
  icon?: LucideIcon;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
}

export function MinimalButton({
  icon: Icon,
  children,
  onClick,
  disabled,
  className,
  variant = "default",
  size = "default",
  isLoading = false,
}: MinimalButtonProps) {
  const defaultStyle = variant === "default" 
    ? "bg-red-700 hover:bg-red-800 text-white rounded-md px-1.5 py-1 text-xs font-normal shadow-sm h-7"
    : "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-md px-1.5 py-1 text-xs font-normal shadow-sm h-7";
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={className || defaultStyle}
    >
      {isLoading ? (
        <>
          <Loader2 className="-mr-0.5 h-3 w-3 animate-spin" />
          {children}
        </>
      ) : Icon ? (
        <>
          <Icon className="-mr-0.5 h-3 w-3" />
          {children}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

