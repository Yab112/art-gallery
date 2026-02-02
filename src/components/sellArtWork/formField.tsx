import { Label } from "@/components/ui/label"
import type React from "react"

interface FormFieldProps {
    label: string
    required?: boolean
    description?: string
    children: React.ReactNode
    htmlFor?: string
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
    htmlFor
}: FormFieldProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor={htmlFor}>
                {label}
                {required && <span className="text-destructive">*</span>}
            </Label>
            {description && <p className="text-destructive text-sm">{description}</p>}
            {children}
        </div>
    )
}
