import { Image as ImageIcon, Video, VideoOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ArtPlaceholderProps {
  className?: string;
  iconSize?: number;
  text?: string;
  type?: "IMAGE" | "VIDEO" | "BREAKING_VIDEO";
}

export function ArtPlaceholder({
  className,
  iconSize = 48,
  text,
  type = "IMAGE",
}: ArtPlaceholderProps) {
  const isSmall = iconSize < 32;
  const isVideo = type === "VIDEO" || type === "BREAKING_VIDEO";
  const isBreaking = type === "BREAKING_VIDEO";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center bg-[#f8f8f8] text-gray-300 transition-all duration-500 group-hover:bg-[#f0f0f0]",
        "border border-gray-100",
        isVideo &&
          "bg-gray-900 group-hover:bg-gray-800 text-gray-500 border-gray-800",
        isBreaking && "bg-red-950 group-hover:bg-red-900 border-red-900/30",
        className,
      )}
    >
      <div className={cn("relative", isSmall ? "mb-2" : "mb-6")}>
        <div
          className={cn(
            "absolute inset-0 scale-[2] rounded-full blur-3xl animate-pulse",
            isBreaking
              ? "bg-red-600/20"
              : isVideo
                ? "bg-red-900/20"
                : "bg-gray-200/30",
          )}
        />
        <div
          className={cn(
            "relative z-10 flex items-center justify-center rounded-full border backdrop-blur-sm shadow-sm",
            isBreaking
              ? "border-red-500 bg-red-600/20"
              : isVideo
                ? "border-gray-700 bg-gray-900/50"
                : "border-gray-200/50 bg-white/50",
            isSmall ? "h-10 w-10" : "h-20 w-20",
          )}
        >
          {isVideo ? (
            <VideoOff
              size={iconSize}
              strokeWidth={1}
              className={cn(isBreaking ? "text-red-500" : "text-red-900/60")}
            />
          ) : (
            <ImageIcon
              size={iconSize}
              strokeWidth={0.5}
              className="text-gray-400 opacity-60"
            />
          )}
        </div>
      </div>
      <div className="flex flex-col items-center gap-1 px-4 text-center">
        <span
          className={cn(
            "font-black uppercase tracking-[0.4em]",
            isBreaking
              ? "text-red-400"
              : isVideo
                ? "text-gray-600"
                : "text-gray-400",
            isSmall ? "text-[7px]" : "text-[10px]",
          )}
        >
          {isBreaking ? "Breaking News" : text || "The Art Journal"}
        </span>
        {!isSmall && (
          <>
            <div
              className={cn(
                "h-[1px] w-8",
                isBreaking
                  ? "bg-red-800"
                  : isVideo
                    ? "bg-gray-800"
                    : "bg-gray-200",
              )}
            />
            <span
              className={cn(
                "font-medium text-[8px] uppercase tracking-[0.2em]",
                isBreaking
                  ? "text-red-500"
                  : isVideo
                    ? "text-red-900/40"
                    : "text-gray-300",
              )}
            >
              {isBreaking
                ? "Breaking Video Missing"
                : isVideo
                  ? "No Video Available"
                  : "No Media Available"}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
