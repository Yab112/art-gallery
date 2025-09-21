import { Heart, Share2 } from "lucide-react";
import type React from "react";

interface ArtworkActionsProps {
  isSaved: boolean;
  onSave: () => void;
}

export const ArtworkActions: React.FC<ArtworkActionsProps> = ({
  isSaved,
  onSave,
}) => (
  <div className="flex items-center justify-center gap-6">
    <button
      type="button"
      onClick={onSave}
      className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
    >
      <Heart
        className={`h-5 w-5 ${isSaved ? "fill-current text-red-500" : ""}`}
      />
      <span>Save</span>
    </button>
    <button
      type="button"
      className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
    >
      <Share2 className="h-5 w-5" />
      <span>Share</span>
    </button>
  </div>
);
