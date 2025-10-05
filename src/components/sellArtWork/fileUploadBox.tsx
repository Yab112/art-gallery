import type React from "react";
import { Button } from "@/components/ui/button";
import { FileIcon, X } from "lucide-react";

interface FileUploadBoxProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  acceptedFormats: string[];
  label?: string;
  id: string;
}

export function FileUploadBox({
  file,
  onFileSelect,
  onRemove,
  acceptedFormats,
  label = "Add document",
  id,
}: FileUploadBoxProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  if (file) {
    return (
      <div className="relative flex items-center gap-3 p-4 border-2 border-border rounded-lg bg-muted/30">
        <FileIcon className="w-8 h-8 text-muted-foreground flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">
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
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <label
      htmlFor={id}
      className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
    >
      <FileIcon className="w-12 h-12 text-muted-foreground mb-2" />
      <span className="text-sm text-muted-foreground">{label}</span>
      <input
        id={id}
        type="file"
        className="hidden"
        accept={acceptedFormats.join(",")}
        onChange={handleFileChange}
      />
    </label>
  );
}
