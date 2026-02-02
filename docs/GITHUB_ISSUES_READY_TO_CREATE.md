# GitHub Issues - Ready to Create

Copy and paste each issue below into GitHub's "New Issue" form at:
https://github.com/Yab112/art-gallery/issues/new

---

## Issue 1: No Terms and Policies Agreement Enforcement on Signup

### Title
```
[Security/Compliance] No Terms and Policies Agreement Enforcement on New User Signup
```

### Labels
`security`, `compliance`, `high-priority`, `enhancement`

### Body
```markdown
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

## Priority

**High** - Legal compliance requirement

## Documentation

See `docs/ISSUE_01_TERMS_AND_POLICIES_ENFORCEMENT.md` for detailed implementation guide.
```

---

## Issue 2: Payment Pages Not Protected - No OTP Enforcement

### Title
```
[Security] Payment Related Pages Not Protected - No OTP Enforcement on Sensitive Actions
```

### Labels
`security`, `critical`, `payment`, `enhancement`

### Body
```markdown
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

## Proposed Solution

1. Add `ProtectedRoute` to PaymentSuccess and PaymentCancel pages
2. Implement OTP verification modal before payment processing
3. Add 2FA configuration option in user settings

## Acceptance Criteria

- [ ] PaymentSuccess page requires authentication
- [ ] PaymentCancel page requires authentication
- [ ] OTP verification required before completing payment
- [ ] Users can enable/disable 2FA in settings
- [ ] OTP codes expire after 5-10 minutes

## Priority

**Critical** - Security vulnerability affecting financial transactions

## Documentation

See `docs/ISSUE_02_PAYMENT_PAGE_OTP_PROTECTION.md` for detailed implementation guide.
```

---

## Issue 3: No Cloudflare "I Am Human" Check on Login/Signup

### Title
```
[Security] No Bot Protection (Cloudflare Turnstile/CAPTCHA) on Login and Signup
```

### Labels
`security`, `critical`, `authentication`, `enhancement`

### Body
```markdown
## Problem Description

The login and signup pages have no bot protection mechanisms. This exposes the application to:
- Automated bot attacks
- Credential stuffing attacks
- Brute force password attempts
- Spam account creation
- Resource exhaustion attacks

## Current Behavior

- Login form submits directly without CAPTCHA
- Signup form allows unlimited account creation attempts
- No rate limiting indicators on frontend
- No human verification required

## Verification

```bash
# Search confirms no CAPTCHA implementation
grep -ri "captcha\|turnstile\|recaptcha\|hcaptcha" src/
# No matches found
```

## Security Impact

| Attack Type | Current Protection | Risk Level |
|-------------|-------------------|------------|
| Credential Stuffing | None | 🔴 Critical |
| Brute Force Login | None | 🔴 Critical |
| Spam Account Creation | None | 🔴 High |
| Automated Scraping | None | 🟡 Medium |

## Proposed Solution

Integrate Cloudflare Turnstile:

```bash
npm install @marsidev/react-turnstile
```

Add to login/signup forms:
```tsx
import { Turnstile } from "@marsidev/react-turnstile"

<Turnstile
    siteKey={TURNSTILE_SITE_KEY}
    onSuccess={(token) => setTurnstileToken(token)}
/>
```

## Acceptance Criteria

- [ ] Turnstile widget loads on signup page
- [ ] Turnstile widget loads on login page
- [ ] Cannot submit forms without completing verification
- [ ] Backend validates Turnstile token
- [ ] Widget resets after failed attempts

## Priority

**Critical** - Security vulnerability

## Documentation

See `docs/ISSUE_03_CLOUDFLARE_TURNSTILE_BOT_PROTECTION.md` for detailed implementation guide.
```

---

## Issue 4: Dropdown Page Glitch - Visual Shifting

### Title
```
[Bug/UX] Dropdown Menu Causes Page Content to Shift Horizontally
```

### Labels
`bug`, `ui/ux`, `medium-priority`

### Body
```markdown
## Problem Description

When opening dropdown menus (particularly the mega-menu for Artworks/Artists navigation and user dropdown), the page content shifts horizontally, creating a jarring visual experience.

## Current Behavior

1. User clicks on Artworks or Artists dropdown
2. Page content shifts left/right by ~15-17px
3. When dropdown closes, content shifts back
4. Most noticeable on Windows browsers where scrollbar takes up space

## Root Cause

Radix UI components trigger scroll-locking behavior that:
1. Adds `overflow: hidden` to body
2. Adds margin/padding compensation for disappearing scrollbar
3. This compensation causes the visible page shift

## Files Affected

- `src/components/mega-menu.tsx`
- `src/components/user-dropdown.tsx`
- `src/index.css`

## Quick Fix

Add to `src/index.css`:

```css
/* Prevent page shift when dropdowns open */
html {
  overflow-y: scroll;
  scrollbar-gutter: stable;
}

body[data-scroll-locked],
html[data-scroll-locked] {
  margin: 0 !important;
  padding-right: 0 !important;
  overflow-y: scroll !important;
}
```

## Acceptance Criteria

- [ ] Open Artworks mega-menu - no page shift
- [ ] Open Artists mega-menu - no page shift
- [ ] Open user dropdown - no page shift
- [ ] Test on Chrome Windows, Firefox, Edge
- [ ] Test rapid open/close - no accumulated shift

## Priority

**Medium** - User experience issue

## Documentation

See `docs/ISSUE_04_DROPDOWN_PAGE_GLITCH.md` for detailed analysis and solutions.
```

---

## How to Create These Issues

1. Go to https://github.com/Yab112/art-gallery/issues
2. Click "New Issue"
3. Copy the **Title** into the title field
4. Copy the **Body** (everything in the markdown code block) into the description
5. Add the suggested **Labels** (you may need to create them first)
6. Click "Submit new issue"

Repeat for all 4 issues.
