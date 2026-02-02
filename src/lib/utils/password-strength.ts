/**
 * Password Strength Helper Functions
 * Provides robust password validation and strength checking utilities
 */

export type PasswordStrengthLevel = "weak" | "fair" | "good" | "strong"

export interface PasswordStrengthResult {
    level: PasswordStrengthLevel
    score: number // 0-4
    requirements: PasswordRequirement[]
    message: string
}

export interface PasswordRequirement {
    id: string
    label: string
    met: boolean
}

export interface PasswordMatchResult {
    matches: boolean
    message: string
}

/**
 * Password requirements configuration
 */
const PASSWORD_REQUIREMENTS = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: true
}

/**
 * Check password against all requirements and calculate strength
 */
export function checkPasswordStrength(password: string): PasswordStrengthResult {
    const requirements: PasswordRequirement[] = [
        {
            id: "length",
            label: `At least ${PASSWORD_REQUIREMENTS.minLength} characters`,
            met: password.length >= PASSWORD_REQUIREMENTS.minLength
        },
        {
            id: "uppercase",
            label: "Contains uppercase letter (A-Z)",
            met: /[A-Z]/.test(password)
        },
        {
            id: "lowercase",
            label: "Contains lowercase letter (a-z)",
            met: /[a-z]/.test(password)
        },
        {
            id: "number",
            label: "Contains number (0-9)",
            met: /\d/.test(password)
        },
        {
            id: "special",
            label: "Contains special character (!@#$%^&*)",
            met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
        }
    ]

    // Calculate score based on met requirements
    const metCount = requirements.filter((req) => req.met).length
    const score = Math.min(metCount, 4)

    // Determine strength level based on score
    let level: PasswordStrengthLevel
    let message: string

    if (password.length === 0) {
        level = "weak"
        message = "Enter a password"
    } else if (score <= 1) {
        level = "weak"
        message = "Weak password - Add more characters and variety"
    } else if (score === 2) {
        level = "fair"
        message = "Fair password - Getting better, add more variety"
    } else if (score === 3) {
        level = "good"
        message = "Good password - Almost there!"
    } else {
        level = "strong"
        message = "Strong password - Your password is secure!"
    }

    return {
        level,
        score,
        requirements,
        message
    }
}

/**
 * Get the color class for the password strength indicator
 */
export function getPasswordStrengthColor(level: PasswordStrengthLevel): {
    bg: string
    text: string
    border: string
} {
    switch (level) {
        case "weak":
            return {
                bg: "bg-red-500",
                text: "text-red-600",
                border: "border-red-500"
            }
        case "fair":
            return {
                bg: "bg-yellow-500",
                text: "text-yellow-600",
                border: "border-yellow-500"
            }
        case "good":
            return {
                bg: "bg-blue-500",
                text: "text-blue-600",
                border: "border-blue-500"
            }
        case "strong":
            return {
                bg: "bg-green-500",
                text: "text-green-600",
                border: "border-green-500"
            }
        default:
            return {
                bg: "bg-gray-300",
                text: "text-gray-500",
                border: "border-gray-300"
            }
    }
}

/**
 * Get a user-friendly message based on password strength
 */
export function getPasswordStrengthMessage(level: PasswordStrengthLevel): string {
    switch (level) {
        case "weak":
            return "Weak"
        case "fair":
            return "Fair"
        case "good":
            return "Good"
        case "strong":
            return "Strong"
        default:
            return ""
    }
}

/**
 * Check if password and confirm password match
 */
export function checkPasswordMatch(password: string, confirmPassword: string): PasswordMatchResult {
    if (confirmPassword.length === 0) {
        return {
            matches: false,
            message: ""
        }
    }

    if (password === confirmPassword) {
        return {
            matches: true,
            message: "Passwords match!"
        }
    }

    return {
        matches: false,
        message: "Passwords do not match"
    }
}

/**
 * Get the overall password validity status
 * Returns true if password meets minimum requirements (length + at least 3 other requirements)
 */
export function isPasswordValid(password: string): boolean {
    const { score, requirements } = checkPasswordStrength(password)
    const lengthMet = requirements.find((r) => r.id === "length")?.met || false
    return lengthMet && score >= 3
}
