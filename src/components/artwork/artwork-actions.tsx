import { Heart, Share2 } from "lucide-react"
import type React from "react"

interface ArtworkActionsProps {
    isSaved: boolean
    onSave: () => void
    isGuest?: boolean
    onShare?: () => void
}

export const ArtworkActions: React.FC<ArtworkActionsProps> = ({
    isSaved,
    onSave,
    isGuest = false,
    onShare
}) => (
    <div className="flex items-center justify-center gap-4">
        {!isGuest && (
            <button
                type="button"
                onClick={onSave}
                className="flex items-center gap-1.5 text-gray-600 text-sm transition-colors hover:text-gray-900"
            >
                <Heart className={`h-4 w-4 ${isSaved ? "fill-current text-red-500" : ""}`} />
                <span>Save</span>
            </button>
        )}
        <button
            type="button"
            onClick={onShare ?? (() => {})}
            className="flex items-center gap-1.5 text-gray-600 text-sm transition-colors hover:text-gray-900"
        >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
        </button>
    </div>
)
