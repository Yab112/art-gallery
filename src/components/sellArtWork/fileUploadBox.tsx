import { Button } from "@/components/ui/button"
import { FileIcon, X } from "lucide-react"
import type React from "react"

interface FileUploadBoxProps {
    file: File | null
    onFileSelect: (file: File) => void
    onRemove: () => void
    acceptedFormats: string[]
    label?: string
    id: string
}

export function FileUploadBox({
    file,
    onFileSelect,
    onRemove,
    acceptedFormats,
    label = "Add document",
    id
}: FileUploadBoxProps) {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            onFileSelect(selectedFile)
        }
    }

    if (file) {
        return (
            <div className="relative flex items-center gap-3 rounded-lg border-2 border-border bg-muted/30 p-4">
                <FileIcon className="h-8 w-8 flex-shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-sm">{file.name}</p>
                    <p className="text-muted-foreground text-xs">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={onRemove}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        )
    }

    return (
        <label
            htmlFor={id}
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-border border-dashed p-8 transition-colors hover:bg-muted/50"
        >
            <FileIcon className="mb-2 h-12 w-12 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">{label}</span>
            <input
                id={id}
                type="file"
                className="hidden"
                accept={acceptedFormats.join(",")}
                onChange={handleFileChange}
            />
        </label>
    )
}
