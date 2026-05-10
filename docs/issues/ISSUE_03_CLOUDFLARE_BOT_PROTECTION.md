# [Security] No Bot Protection (Cloudflare Turnstile/CAPTCHA) on Login and Signup

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

## Files Affected

- `src/components/auth/signin-form.tsx`
- `src/components/auth/signup-form.tsx`
- `src/pages/ForgotPassword.tsx`

## Proposed Solution

Install Cloudflare Turnstile:

```bash
npm install @marsidev/react-turnstile
```

Add to login/signup forms:

```tsx
import { Turnstile } from "@marsidev/react-turnstile"

// In form component
const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

// In JSX, before submit button
<Turnstile
    siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
    onSuccess={(token) => setTurnstileToken(token)}
    onError={() => setTurnstileToken(null)}
/>

// Disable submit until token received
<Button disabled={!turnstileToken}>
    Submit
</Button>
```

## Acceptance Criteria

- [ ] Turnstile widget loads on signup page
- [ ] Turnstile widget loads on login page
- [ ] Cannot submit forms without completing verification
- [ ] Backend validates Turnstile token
- [ ] Widget resets after failed attempts
- [ ] Works on mobile devices

## Labels

`security`, `critical`, `authentication`, `enhancement`

## Priority

**Critical** - Security vulnerability exposing auth endpoints to automated attacks
