# Issue #2: Payment Related Pages Not Protected - No OTP Enforcement on Sensitive Actions

## Problem Summary

Payment-related pages and sensitive financial actions lack adequate security protection. Specifically:
1. Payment pages do not enforce OTP (One-Time Password) verification before processing transactions
2. No two-factor authentication (2FA) enforcement for sensitive operations
3. Payment success and cancel pages can be accessed directly without proper validation

## Current Implementation Analysis

### 1. Payment Pages Route Protection

**Checkout Page (`src/pages/Checkout.tsx`):**
- ✅ Uses `ProtectedRoute` wrapper - requires authentication
- ❌ No OTP/2FA verification before payment processing
- ❌ No session re-validation before sensitive action

```typescript
// Current implementation - only basic auth protection
return (
    <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
            {/* ... */}
        </div>
    </ProtectedRoute>
)
```

**Payment Success Page (`src/pages/PaymentSuccess.tsx`):**
- ❌ No `ProtectedRoute` wrapper
- ❌ Can be accessed by anyone with the URL
- ⚠️ Relies only on `txRef` URL parameter for verification

```typescript
// Current - No authentication check
export default function PaymentSuccessPage() {
    // ... directly processes payment verification
    const txRef = searchParams.get("txRef") || searchParams.get("token")
    // Verification happens but page is publicly accessible
}
```

**Payment Cancel Page (`src/pages/PaymentCancel.tsx`):**
- ❌ No `ProtectedRoute` wrapper
- ❌ Publicly accessible page

### 2. Sensitive Actions Without OTP

**Current sensitive actions lacking OTP verification:**

| Action | Current Protection | Required Protection |
|--------|-------------------|---------------------|
| Checkout/Payment | Basic Auth | OTP + Auth |
| Password Change | Password only | OTP + Password |
| Email Change | No verification | OTP + Confirmation |
| Bank Account Update | None | OTP required |
| Withdrawal Request | None | OTP required |
| Delete Account | None | OTP + Password |

### 3. User Type Analysis (`src/types/user.types.ts`)

```typescript
// twoFactorEnabled field exists but is not enforced
twoFactorEnabled: boolean
```

The field exists but there's no implementation to:
- Enable/disable 2FA
- Verify OTP before sensitive actions
- Generate and validate OTP codes

### 4. Settings Page Analysis

From review of Settings page patterns:
- No OTP setup section
- No 2FA configuration UI
- No security settings for sensitive action verification

## Security Vulnerabilities

### High Risk
1. **Session Hijacking**: If session is stolen, attacker can make payments
2. **CSRF Attacks**: Payment actions could be triggered by malicious sites
3. **Unauthorized Access**: Payment success page reveals transaction details

### Medium Risk
1. **Account Takeover**: No verification for password/email changes
2. **Financial Fraud**: No secondary verification for financial transactions

## Proposed Solution

### Phase 1: Add OTP Infrastructure

#### 1.1 Create OTP Service (`src/services/otp/`)

```typescript
// src/services/otp/useRequestOTP.ts
import { useMutation } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"

export interface RequestOTPParams {
    purpose: "payment" | "password_change" | "email_change" | "withdrawal" | "delete_account"
    method: "email" | "sms" | "authenticator"
}

export const useRequestOTP = () => {
    return useMutation({
        mutationFn: async (params: RequestOTPParams) => {
            const response = await apiClient.post("/api/otp/request", params)
            return response.data
        }
    })
}
```

```typescript
// src/services/otp/useVerifyOTP.ts
import { useMutation } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"

export interface VerifyOTPParams {
    code: string
    purpose: string
    transactionId?: string
}

export const useVerifyOTP = () => {
    return useMutation({
        mutationFn: async (params: VerifyOTPParams) => {
            const response = await apiClient.post("/api/otp/verify", params)
            return response.data
        }
    })
}
```

#### 1.2 Create OTP Verification Modal Component

```typescript
// src/components/auth/otp-verification-modal.tsx
import { useState } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRequestOTP } from "@/services/otp/useRequestOTP"
import { useVerifyOTP } from "@/services/otp/useVerifyOTP"

interface OTPVerificationModalProps {
    isOpen: boolean
    onClose: () => void
    onVerified: (token: string) => void
    purpose: "payment" | "password_change" | "email_change" | "withdrawal"
    title?: string
    description?: string
}

export function OTPVerificationModal({
    isOpen,
    onClose,
    onVerified,
    purpose,
    title = "Verify Your Identity",
    description = "Enter the verification code sent to your email"
}: OTPVerificationModalProps) {
    const [code, setCode] = useState("")
    const [error, setError] = useState<string | null>(null)
    
    const { mutate: requestOTP, isPending: isRequesting } = useRequestOTP()
    const { mutate: verifyOTP, isPending: isVerifying } = useVerifyOTP()

    const handleRequestOTP = () => {
        requestOTP(
            { purpose, method: "email" },
            {
                onSuccess: () => {
                    // OTP sent successfully
                },
                onError: (err: any) => {
                    setError(err?.message || "Failed to send verification code")
                }
            }
        )
    }

    const handleVerify = () => {
        if (code.length !== 6) {
            setError("Please enter a 6-digit code")
            return
        }

        verifyOTP(
            { code, purpose },
            {
                onSuccess: (data) => {
                    onVerified(data.verificationToken)
                },
                onError: (err: any) => {
                    setError(err?.message || "Invalid verification code")
                }
            }
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
                
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            maxLength={6}
                            className="text-center text-lg tracking-widest"
                        />
                    </div>
                    
                    {error && (
                        <p className="text-red-500 text-sm">{error}</p>
                    )}
                    
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleRequestOTP}
                            disabled={isRequesting}
                            className="flex-1"
                        >
                            {isRequesting ? "Sending..." : "Send Code"}
                        </Button>
                        <Button
                            onClick={handleVerify}
                            disabled={isVerifying || code.length !== 6}
                            className="flex-1"
                        >
                            {isVerifying ? "Verifying..." : "Verify"}
                        </Button>
                    </div>
                    
                    <p className="text-gray-500 text-xs text-center">
                        Didn't receive the code? Check your spam folder or request a new code.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
```

### Phase 2: Protect Payment Pages

#### 2.1 Add ProtectedRoute to Payment Pages

**PaymentSuccess.tsx:**
```typescript
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function PaymentSuccessPage() {
    // ... existing code

    return (
        <ProtectedRoute>
            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
                {/* ... existing content */}
            </div>
        </ProtectedRoute>
    )
}
```

**PaymentCancel.tsx:**
```typescript
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function PaymentCancelPage() {
    return (
        <ProtectedRoute>
            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
                {/* ... existing content */}
            </div>
        </ProtectedRoute>
    )
}
```

#### 2.2 Add OTP Verification to Checkout

Update `src/pages/Checkout.tsx`:

```typescript
import { OTPVerificationModal } from "@/components/auth/otp-verification-modal"

function CheckoutContent() {
    // ... existing state
    const [showOTPModal, setShowOTPModal] = useState(false)
    const [otpVerificationToken, setOTPVerificationToken] = useState<string | null>(null)

    const handlePlaceOrder = async () => {
        if (!agreedToTerms) {
            toast.error("Please agree to the Terms of Service and Privacy Policy")
            return
        }

        // Check if OTP verification is required and not yet completed
        if (!otpVerificationToken) {
            setShowOTPModal(true)
            return
        }

        // ... existing order placement code
        // Include otpVerificationToken in the order request
    }

    const handleOTPVerified = (token: string) => {
        setOTPVerificationToken(token)
        setShowOTPModal(false)
        // Proceed with order placement
        handlePlaceOrder()
    }

    return (
        <ProtectedRoute>
            {/* ... existing content */}
            
            <OTPVerificationModal
                isOpen={showOTPModal}
                onClose={() => setShowOTPModal(false)}
                onVerified={handleOTPVerified}
                purpose="payment"
                title="Secure Your Payment"
                description="For your security, please verify your identity before completing this payment."
            />
        </ProtectedRoute>
    )
}
```

### Phase 3: Add 2FA Configuration to Settings

#### 3.1 Create 2FA Settings Section

```typescript
// src/components/settings/security-settings.tsx
export function SecuritySettings() {
    const { user } = useAuth()
    const [is2FAEnabled, setIs2FAEnabled] = useState(user?.twoFactorEnabled || false)

    return (
        <div className="space-y-6">
            <div>
                <h3 className="font-medium text-lg">Two-Factor Authentication</h3>
                <p className="text-gray-500 text-sm">
                    Add an extra layer of security to your account
                </p>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                    <p className="font-medium">Email Verification</p>
                    <p className="text-gray-500 text-sm">
                        Require code verification for sensitive actions
                    </p>
                </div>
                <Switch
                    checked={is2FAEnabled}
                    onCheckedChange={handleToggle2FA}
                />
            </div>

            <div className="text-sm text-gray-600">
                <p className="font-medium mb-2">Protected Actions:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Payment processing</li>
                    <li>Password changes</li>
                    <li>Email address changes</li>
                    <li>Withdrawal requests</li>
                    <li>Account deletion</li>
                </ul>
            </div>
        </div>
    )
}
```

### Phase 4: Backend Requirements

The backend needs to implement:

1. **OTP Generation Endpoint:**
   - POST `/api/otp/request`
   - Generate 6-digit code
   - Store with expiration (5-10 minutes)
   - Send via email/SMS

2. **OTP Verification Endpoint:**
   - POST `/api/otp/verify`
   - Validate code against stored value
   - Return verification token for subsequent requests
   - Mark as used to prevent replay

3. **Protected Endpoints:**
   - Require OTP verification token header
   - Validate token expiration
   - Log verification attempts

## Files to Modify/Create

### New Files
1. `src/services/otp/useRequestOTP.ts`
2. `src/services/otp/useVerifyOTP.ts`
3. `src/components/auth/otp-verification-modal.tsx`
4. `src/components/settings/security-settings.tsx`

### Modified Files
1. `src/pages/Checkout.tsx` - Add OTP verification before payment
2. `src/pages/PaymentSuccess.tsx` - Add ProtectedRoute wrapper
3. `src/pages/PaymentCancel.tsx` - Add ProtectedRoute wrapper
4. `src/pages/Settings.tsx` - Add security settings section

## Testing Checklist

- [ ] Checkout requires OTP verification before payment
- [ ] PaymentSuccess page redirects to login if not authenticated
- [ ] PaymentCancel page redirects to login if not authenticated
- [ ] OTP code is sent to user's email
- [ ] Invalid OTP code shows error message
- [ ] Expired OTP code shows appropriate error
- [ ] OTP can be resent after waiting period
- [ ] 2FA can be enabled/disabled in settings
- [ ] Verification token expires after single use

## Priority

**High** - Security vulnerability affecting financial transactions

## Estimated Effort

- OTP Service Implementation: 4-6 hours
- OTP Modal Component: 2-3 hours
- Page Protection Updates: 2-3 hours
- Settings Integration: 2-3 hours
- Backend OTP System: 8-12 hours
- Testing: 4-6 hours

**Total: 22-33 hours**

## Security Considerations

1. **Rate Limiting**: Limit OTP requests to prevent abuse
2. **Code Expiration**: OTP codes should expire after 5-10 minutes
3. **Attempt Limiting**: Lock after 3-5 failed attempts
4. **Secure Transmission**: Always use HTTPS
5. **Logging**: Log all OTP verification attempts for audit

---

**Status:** 🔴 Not Implemented  
**Severity:** Critical - Security/Financial Risk  
**Category:** Security
