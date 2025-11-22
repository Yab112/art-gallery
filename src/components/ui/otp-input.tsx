import * as React from "react";
import { cn } from "@/lib/utils";

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  onComplete,
  className,
  disabled = false,
}: OTPInputProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, inputValue: string) => {
    // Only allow digits
    const sanitizedValue = inputValue.replace(/[^0-9]/g, "");

    if (sanitizedValue.length > 1) {
      // Handle paste
      const pastedValue = sanitizedValue.slice(0, length);
      onChange(pastedValue);

      // Focus last filled input or last input
      const lastFilledIndex = Math.min(pastedValue.length - 1, length - 1);
      inputRefs.current[lastFilledIndex]?.focus();

      if (pastedValue.length === length && onComplete) {
        onComplete(pastedValue);
      }
      return;
    }

    // Update value at index
    const newValue = value.split("");
    newValue[index] = sanitizedValue;
    const updatedValue = newValue.join("").slice(0, length);

    onChange(updatedValue);

    // Move to next input if value entered
    if (sanitizedValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete if all inputs filled
    if (updatedValue.length === length && onComplete) {
      onComplete(updatedValue);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newValue = value.split("");
        newValue[index] = "";
        onChange(newValue.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    inputRefs.current[index]?.select();
  };

  return (
    <div className={cn("flex gap-2", className)}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          className={cn(
            "h-12 w-12 text-center text-lg font-semibold",
            "border-2 border-gray-300 rounded-lg",
            "focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200",
            "disabled:bg-gray-100 disabled:cursor-not-allowed",
            "transition-all",
            value[index] && "border-red-500"
          )}
        />
      ))}
    </div>
  );
}
