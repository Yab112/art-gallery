import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ArtPlaceholderProps {
  className?: string;
  iconSize?: number;
  text?: string;
}

export function ArtPlaceholder({
  className,
  iconSize = 48,
  text,
}: ArtPlaceholderProps) {
  const isSmall = iconSize < 32;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center bg-[#f8f8f8] text-gray-300 transition-all duration-500 group-hover:bg-[#f0f0f0]",
        "border border-gray-100",
        className,
      )}
    >
      <div className={cn("relative", isSmall ? "mb-2" : "mb-6")}>
        <div className="absolute inset-0 scale-[2] rounded-full bg-gray-200/30 blur-3xl animate-pulse" />
        <div
          className={cn(
            "relative z-10 flex items-center justify-center rounded-full border border-gray-200/50 bg-white/50 backdrop-blur-sm shadow-sm",
            isSmall ? "h-10 w-10" : "h-20 w-20",
          )}
        >
          <ImageIcon
            size={iconSize}
            strokeWidth={0.5}
            className="text-gray-400 opacity-60"
          />
        </div>
      </div>
      <div className="flex flex-col items-center gap-1 px-4 text-center">
        <span
          className={cn(
            "font-black text-gray-400 uppercase tracking-[0.4em]",
            isSmall ? "text-[7px]" : "text-[10px]",
          )}
        >
          {text || "The Art Journal"}
        </span>
        {!isSmall && (
          <>
            <div className="h-[1px] w-8 bg-gray-200" />
            <span className="font-medium text-gray-300 text-[8px] uppercase tracking-[0.2em]">
              No Media Available
            </span>
          </>
        )}
      </div>
    </div>
  );
}
