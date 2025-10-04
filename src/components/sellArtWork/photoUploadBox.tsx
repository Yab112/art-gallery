"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { ImageIcon, X } from "lucide-react"
import { ACCEPTED_IMAGE_FORMATS } from "@/lib/constants/srtsell.constant"

interface PhotoUploadBoxProps {
  index: number
  file: File | null
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
    return (
      <div className="relative aspect-square group">
        <img
          src={URL.createObjectURL(file) || "/placeholder.svg"}
          alt={`Photo ${index + 1}`}
          className="w-full h-full object-cover rounded-lg border border-border"
        />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onRemove(index)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <label
      htmlFor={`photo-${index}`}
      className="flex flex-col items-center justify-center aspect-square bg-muted/30 border border-border rounded cursor-pointer hover:bg-muted/50 transition-colors"
    >
      <ImageIcon className="w-10 h-10 text-muted-foreground/60 mb-2" />
      <span className="text-xs text-muted-foreground">Add photo {index + 1}</span>
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
