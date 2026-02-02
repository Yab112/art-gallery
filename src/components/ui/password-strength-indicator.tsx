import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  checkPasswordStrength,
  checkPasswordMatch,
  getPasswordStrengthColor,
  getPasswordStrengthMessage,
  type PasswordStrengthResult,
  type PasswordMatchResult,
} from "@/lib/utils/password-strength";

interface PasswordStrengthIndicatorProps {
  password: string;
  confirmPassword?: string;
  showRequirements?: boolean;
  className?: string;
}

/**
 * Password Strength Indicator Component
 * Shows a visual stepper/progress bar with color coding for password strength
 * Optionally shows password requirements checklist and match status
 */
export function PasswordStrengthIndicator({
  password,
  confirmPassword,
  showRequirements = true,
  className,
}: PasswordStrengthIndicatorProps) {
  const strengthResult: PasswordStrengthResult = checkPasswordStrength(password);
  const matchResult: PasswordMatchResult | null =
    confirmPassword !== undefined
      ? checkPasswordMatch(password, confirmPassword)
      : null;

  const colors = getPasswordStrengthColor(strengthResult.level);
  const strengthLabel = getPasswordStrengthMessage(strengthResult.level);

  // Calculate active steps (0-4 based on score)
  const activeSteps = password.length > 0 ? Math.max(1, strengthResult.score) : 0;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Strength Stepper/Progress Bar */}
      {password.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Password Strength:</span>
            <span className={cn("text-sm font-medium", colors.text)}>
              {strengthLabel}
            </span>
          </div>

          {/* Stepper Progress Bar */}
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={cn(
                  "h-2 flex-1 rounded-full transition-all duration-300",
                  step <= activeSteps ? colors.bg : "bg-gray-200"
                )}
              />
            ))}
          </div>

          {/* Strength Message */}
          <p className={cn("text-xs", colors.text)}>{strengthResult.message}</p>
        </div>
      )}

      {/* Password Requirements Checklist */}
      {showRequirements && password.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-gray-500 font-medium">Requirements:</p>
          <ul className="space-y-1">
            {strengthResult.requirements.map((req) => (
              <li
                key={req.id}
                className={cn(
                  "flex items-center gap-2 text-xs transition-colors duration-200",
                  req.met ? "text-green-600" : "text-gray-500"
                )}
              >
                {req.met ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <X className="h-3.5 w-3.5 text-gray-400" />
                )}
                <span>{req.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Password Match Indicator */}
      {matchResult && confirmPassword && confirmPassword.length > 0 && (
        <div
          className={cn(
            "flex items-center gap-2 text-sm",
            matchResult.matches ? "text-green-600" : "text-red-500"
          )}
        >
          {matchResult.matches ? (
            <Check className="h-4 w-4" />
          ) : (
            <X className="h-4 w-4" />
          )}
          <span>{matchResult.message}</span>
        </div>
      )}
    </div>
  );
}

export { checkPasswordStrength, checkPasswordMatch, isPasswordValid } from "@/lib/utils/password-strength";
