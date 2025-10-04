"use client"

import type React from "react"
import { Plus } from "lucide-react"
import { ACCEPTED_IMAGE_FORMATS } from "@/lib/constants/srtsell.constant"

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
      className={`flex flex-col items-center justify-center aspect-square bg-muted/30 border border-border rounded cursor-pointer hover:bg-muted/50 transition-all shadow-sm hover:shadow-md ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-background border border-border shadow-sm mb-2">
        <Plus className="w-8 h-8 text-muted-foreground" />
      </div>
      <span className="text-xs text-muted-foreground font-medium">Add more</span>
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
