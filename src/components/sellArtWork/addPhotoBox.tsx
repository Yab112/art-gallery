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
            className={`group flex aspect-square cursor-pointer flex-col items-center justify-center rounded border border-border bg-muted/30 shadow-sm transition-all hover:bg-red-50/50 hover:border-red-200 hover:shadow-md ${disabled ? "cursor-not-allowed opacity-50" : ""
                }`}
        >
            <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full border border-red-100 bg-red-50 shadow-sm group-hover:bg-red-100 transition-colors">
                <Plus className="h-8 w-8 text-red-600" />
            </div>
            <span className="font-semibold text-red-600 text-xs">Add more</span>
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
