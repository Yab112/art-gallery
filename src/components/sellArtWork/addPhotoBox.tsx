import { ACCEPTED_IMAGE_FORMATS } from "@/lib/constants/srtsell.constant"
import { Plus } from "lucide-react"
import type React from "react"

interface AddPhotoBoxProps {
    onFileSelect: (file: File) => void
    disabled?: boolean
}

export function AddPhotoBox({ onFileSelect, disabled = false }: AddPhotoBoxProps) {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            onFileSelect(selectedFile)
        }
    }

    return (
        <label
            htmlFor="add-more-photos"
            className={`flex aspect-square cursor-pointer flex-col items-center justify-center rounded border border-border bg-muted/30 shadow-sm transition-all hover:bg-muted/50 hover:shadow-md ${
                disabled ? "cursor-not-allowed opacity-50" : ""
            }`}
        >
            <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-background shadow-sm">
                <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <span className="font-medium text-muted-foreground text-xs">Add more</span>
            <input
                id="add-more-photos"
                type="file"
                className="hidden"
                accept={ACCEPTED_IMAGE_FORMATS.join(",")}
                onChange={handleFileChange}
                disabled={disabled}
            />
        </label>
    )
}
