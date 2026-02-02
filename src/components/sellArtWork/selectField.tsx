import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import type { SelectOption } from "@/types/selart.type"

interface SelectFieldProps {
    value: string
    onChange: (value: string) => void
    options: SelectOption[]
    placeholder?: string
    id?: string
    disabled?: boolean
}

/**
 * SelectField component for dropdown selections
 * Used throughout the artwork selling form for various selection fields
 */
export function SelectField({
    value,
    onChange,
    options,
    placeholder = "Select",
    id,
    disabled = false
}: SelectFieldProps) {
    return (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger id={id}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
