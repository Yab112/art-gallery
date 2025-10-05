import type React from "react";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  label: string;
  required?: boolean;
  description?: string;
  children: React.ReactNode;
  htmlFor?: string;
}

/**
 * FormField component for consistent form field layout
 * Displays label, required indicator, description, and error messages
 */
export function FormField({
  label,
  required = false,
  description,
  children,
  htmlFor,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {description && <p className="text-sm text-destructive">{description}</p>}
      {children}
    </div>
  );
}
