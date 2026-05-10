# Issue #1: No Terms and Policies Agreement Enforcement on New User After Sign Up

## Problem Summary

New users can sign up and use the platform without being required to accept the Terms of Service and Privacy Policy. This poses significant legal and compliance risks for the platform.

## Current Implementation Analysis

### Sign Up Form (`src/components/auth/signup-form.tsx`)

**Current State:**
- The signup form collects: `firstName`, `lastName`, `email`, `password`, `confirmPassword`
- **No checkbox or acceptance mechanism for Terms of Service**
- **No checkbox or acceptance mechanism for Privacy Policy**
- User can complete registration without agreeing to any legal terms

```typescript
// Current SignupFormData interface - MISSING terms acceptance
interface SignupFormData {
    firstName: string
    lastName: string
    email: string
    password: string
    confirmPassword: string
    // ❌ MISSING: acceptTerms: boolean
    // ❌ MISSING: acceptPrivacyPolicy: boolean
}
```

### Comparison with Other Forms

The checkout process (`src/pages/Checkout.tsx`) **does require** terms acceptance:
```typescript
const [agreedToTerms, setAgreedToTerms] = useState(false)

if (!agreedToTerms) {
    toast.error("Please agree to the Terms of Service and Privacy Policy")
    return
}
```

The sell artwork form (`src/components/sellArtWork/bankingSection.tsx`) **does require** terms acceptance:
```typescript
<Checkbox
    name="acceptTermsOfSale"
    id="acceptTermsOfSale"
    // ... terms acceptance checkbox
/>
```

### User Type Definitions (`src/types/user.types.ts`)

The user type does not track terms acceptance:
```typescript
// No fields for:
// - acceptedTermsAt: Date
// - acceptedPrivacyPolicyAt: Date
// - termsVersion: string
```

## Impact

### Legal Risks
1. **GDPR Compliance**: Users must actively consent to data processing policies
2. **Platform Liability**: Without explicit agreement, users may dispute platform policies
3. **Contract Enforceability**: Terms of Service may be unenforceable without documented acceptance

### User Experience Issues
1. Users unaware of platform rules and expectations
2. No audit trail of when users accepted terms
3. Cannot enforce updated terms for existing users

## Proposed Solution

### 1. Update SignupFormData Interface

```typescript
interface SignupFormData {
    firstName: string
    lastName: string
    email: string
    password: string
    confirmPassword: string
    acceptTermsAndPrivacy: boolean // NEW: Required terms acceptance
}
```

### 2. Add Terms Checkbox to Signup Form

Add the following after the confirm password field in `src/components/auth/signup-form.tsx`:

```tsx
<div className="flex items-start space-x-2">
    <Checkbox
        id="acceptTermsAndPrivacy"
        checked={form.watch("acceptTermsAndPrivacy")}
        onCheckedChange={(checked) => 
            form.setValue("acceptTermsAndPrivacy", checked as boolean)
        }
        className="mt-1"
    />
    <Label 
        htmlFor="acceptTermsAndPrivacy" 
        className="cursor-pointer text-gray-600 text-sm leading-relaxed"
    >
        I agree to the{" "}
        <Link 
            to="/terms-of-service" 
            className="text-red-600 hover:underline"
            target="_blank"
        >
            Terms of Service
        </Link>{" "}
        and{" "}
        <Link 
            to="/privacy-policy" 
            className="text-red-600 hover:underline"
            target="_blank"
        >
            Privacy Policy
        </Link>
    </Label>
</div>
{errors.acceptTermsAndPrivacy && (
    <p className="text-red-500 text-sm">
        {errors.acceptTermsAndPrivacy.message}
    </p>
)}
```

### 3. Add Form Validation

```typescript
const form = useForm<SignupFormData>({
    defaultValues: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        acceptTermsAndPrivacy: false // NEW default
    }
})

// In register or validation
{...register("acceptTermsAndPrivacy", {
    validate: (value) => 
        value === true || "You must accept the Terms of Service and Privacy Policy to create an account"
})}
```

### 4. Update Backend User Model (Recommended)

Add to user schema in backend:
```typescript
termsAcceptedAt: Date | null
termsVersion: string | null
privacyPolicyAcceptedAt: Date | null
privacyPolicyVersion: string | null
```

### 5. Create Terms and Privacy Policy Pages

Create the following pages:
- `/terms-of-service` - Terms of Service page
- `/privacy-policy` - Privacy Policy page

Add routes in `src/routes.tsx`:
```typescript
{
    path: "terms-of-service",
    element: <TermsOfServicePage />
},
{
    path: "privacy-policy",
    element: <PrivacyPolicyPage />
}
```

### 6. Handle Google OAuth Sign-ups

For OAuth sign-ups, show a terms acceptance modal on first login:

```tsx
// In a new component: TermsAcceptanceModal.tsx
export function TermsAcceptanceModal({ 
    isOpen, 
    onAccept 
}: { 
    isOpen: boolean
    onAccept: () => void 
}) {
    const [accepted, setAccepted] = useState(false)

    return (
        <Dialog open={isOpen}>
            <DialogContent>
                <DialogTitle>Accept Terms and Conditions</DialogTitle>
                <DialogDescription>
                    To continue using Artopia, please accept our terms.
                </DialogDescription>
                <div className="flex items-center space-x-2">
                    <Checkbox 
                        checked={accepted} 
                        onCheckedChange={setAccepted} 
                    />
                    <Label>
                        I accept the Terms of Service and Privacy Policy
                    </Label>
                </div>
                <Button 
                    onClick={onAccept} 
                    disabled={!accepted}
                >
                    Continue
                </Button>
            </DialogContent>
        </Dialog>
    )
}
```

## Files to Modify

1. `src/components/auth/signup-form.tsx` - Add terms checkbox and validation
2. `src/types/user.types.ts` - Add terms acceptance fields (optional)
3. `src/routes.tsx` - Add terms and privacy policy routes
4. `src/pages/TermsOfService.tsx` - Create new page
5. `src/pages/PrivacyPolicy.tsx` - Create new page
6. `src/components/ui/checkbox.tsx` - Ensure checkbox component exists (already present)

## Testing Checklist

- [ ] User cannot sign up without checking the terms acceptance checkbox
- [ ] Error message displays when form submitted without acceptance
- [ ] Terms of Service link opens in new tab
- [ ] Privacy Policy link opens in new tab
- [ ] Google OAuth users see terms acceptance modal on first login
- [ ] Terms acceptance timestamp is stored in user record (if backend updated)

## Priority

**High** - Legal compliance requirement

## Estimated Effort

- Frontend changes: 2-4 hours
- Terms/Privacy pages creation: 4-8 hours (content writing)
- Backend changes: 2-4 hours
- Testing: 2-3 hours

## Related Files

- `src/components/auth/signup-form.tsx`
- `src/components/auth/signin-form.tsx`
- `src/pages/Signup.tsx`
- `src/pages/Login.tsx`
- `src/lib/auth.ts`
- `src/hooks/use-auth.ts`

---

**Status:** 🔴 Not Implemented  
**Severity:** High - Legal/Compliance Risk  
**Category:** Security & Compliance
