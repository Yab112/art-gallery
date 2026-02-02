# [Security] Payment Related Pages Not Protected - No OTP Enforcement on Sensitive Actions

## Problem Description

Payment-related pages and sensitive financial actions lack adequate security protection:
1. Payment pages do not enforce OTP (One-Time Password) verification
2. No two-factor authentication (2FA) enforcement for sensitive operations
3. PaymentSuccess and PaymentCancel pages can be accessed without authentication

## Current Behavior

### PaymentSuccess.tsx
- ❌ No `ProtectedRoute` wrapper
- Can be accessed by anyone with the URL
- Relies only on txRef URL parameter

### PaymentCancel.tsx
- ❌ No `ProtectedRoute` wrapper
- Publicly accessible

### Checkout.tsx
- ✅ Has `ProtectedRoute` but no OTP verification before payment

## Security Risks

| Risk | Severity |
|------|----------|
| Session hijacking leading to unauthorized payments | Critical |
| CSRF attacks on payment endpoints | High |
| Account takeover without secondary verification | High |

## Files Affected

- `src/pages/Checkout.tsx`
- `src/pages/PaymentSuccess.tsx`
- `src/pages/PaymentCancel.tsx`
- `src/pages/Settings.tsx`

## Proposed Solution

1. Add `ProtectedRoute` to PaymentSuccess and PaymentCancel pages:

```tsx
// PaymentSuccess.tsx
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function PaymentSuccessPage() {
    return (
        <ProtectedRoute>
            {/* existing content */}
        </ProtectedRoute>
    )
}
```

2. Implement OTP verification modal before payment processing
3. Add 2FA configuration option in user settings

## Acceptance Criteria

- [ ] PaymentSuccess page requires authentication
- [ ] PaymentCancel page requires authentication
- [ ] OTP verification required before completing payment
- [ ] Users can enable/disable 2FA in settings
- [ ] OTP codes expire after 5-10 minutes

## Labels

`security`, `critical`, `payment`, `enhancement`

## Priority

**Critical** - Security vulnerability affecting financial transactions
