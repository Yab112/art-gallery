# [Security/Compliance] No Terms and Policies Agreement Enforcement on New User Signup

## Problem Description

New users can sign up and use the platform without being required to accept the Terms of Service and Privacy Policy. This poses significant legal and compliance risks.

## Current Behavior

- Signup form collects: firstName, lastName, email, password, confirmPassword
- **No checkbox or acceptance mechanism for Terms of Service**
- **No checkbox or acceptance mechanism for Privacy Policy**
- User can complete registration without agreeing to any legal terms

## Expected Behavior

- Signup form should include a required checkbox for Terms and Privacy Policy acceptance
- Form should not submit unless checkbox is checked
- Acceptance timestamp should be stored in user record

## Files Affected

- `src/components/auth/signup-form.tsx`
- `src/pages/Signup.tsx`
- `src/types/user.types.ts` (optional - for storing acceptance timestamp)

## Proposed Solution

Add a required checkbox before the signup button:

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
    <Label htmlFor="acceptTermsAndPrivacy">
        I agree to the <Link to="/terms-of-service">Terms of Service</Link> and <Link to="/privacy-policy">Privacy Policy</Link>
    </Label>
</div>
```

## Acceptance Criteria

- [ ] Checkbox is visible on signup form
- [ ] Form cannot be submitted without checking the box
- [ ] Error message displays when submission attempted without acceptance
- [ ] Terms of Service and Privacy Policy links work

## Labels

`security`, `compliance`, `high-priority`, `enhancement`

## Priority

**High** - Legal compliance requirement
