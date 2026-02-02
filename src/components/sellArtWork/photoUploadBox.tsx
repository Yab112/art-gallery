import { Button } from "@/components/ui/button"
import { ACCEPTED_IMAGE_FORMATS } from "@/lib/constants/srtsell.constant"
import { ImageIcon, X } from "lucide-react"
import type React from "react"

interface PhotoUploadBoxProps {
    index: number
    file: File | string | null // Support both File objects and string URLs
    onFileSelect: (index: number, file: File) => void
    onRemove: (index: number) => void
}

export function PhotoUploadBox({ index, file, onFileSelect, onRemove }: PhotoUploadBoxProps) {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            onFileSelect(index, selectedFile)
        }
    }

    if (file) {
        // Handle both File objects and string URLs
        const imageSrc = file instanceof File ? URL.createObjectURL(file) : file

        return (
            <div className="group relative aspect-square">
                <img
                    src={imageSrc || "/placeholder.svg"}
                    alt={`Photo ${index + 1}`}
                    className="h-full w-full rounded-lg border border-border object-cover"
                />
                <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => onRemove(index)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        )
    }

    return (
        <label
            htmlFor={`photo-${index}`}
            className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded border border-border bg-muted/30 transition-colors hover:bg-muted/50"
        >
            <ImageIcon className="mb-2 h-10 w-10 text-muted-foreground/60" />
            <span className="text-muted-foreground text-xs">Add photo {index + 1}</span>
            <input
                id={`photo-${index}`}
                type="file"
                className="hidden"
                accept={ACCEPTED_IMAGE_FORMATS.join(",")}
                onChange={handleFileChange}
            />
        </label>
    )
}
