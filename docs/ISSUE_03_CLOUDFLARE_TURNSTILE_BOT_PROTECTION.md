# Issue #3: No Cloudflare "I Am Human" Check on Login and Signup

## Problem Summary

The login and signup pages lack bot protection mechanisms such as Cloudflare Turnstile, reCAPTCHA, or hCaptcha. This exposes the application to:
- Automated bot attacks
- Credential stuffing attacks
- Brute force password attempts
- Spam account creation
- Resource exhaustion attacks

## Current Implementation Analysis

### Login Form (`src/components/auth/signin-form.tsx`)

**Current State:**
- No CAPTCHA or human verification
- No rate limiting indicator on frontend
- Form submits directly without bot verification

```typescript
// Current implementation - NO bot protection
const onSubmit = async (data: SigninFormData) => {
    setIsLoading(true)
    setError(null)

    try {
        // Direct submission without CAPTCHA verification
        await signIn.email(
            {
                email: data.email,
                password: data.password,
                rememberMe: data.rememberMe
                // ❌ MISSING: captchaToken
            },
            { /* callbacks */ }
        )
    } catch (err: any) {
        // ...
    }
}
```

### Signup Form (`src/components/auth/signup-form.tsx`)

**Current State:**
- No CAPTCHA or human verification
- Allows unlimited account creation attempts
- No protection against automated signups

```typescript
// Current implementation - NO bot protection
const onSubmit = async (data: SignupFormData) => {
    // Direct submission without CAPTCHA
    const result = await signUp.email(
        {
            email: data.email,
            password: data.password,
            name: `${data.firstName} ${data.lastName}`
            // ❌ MISSING: captchaToken
        },
        { /* callbacks */ }
    )
}
```

### Google OAuth (`src/lib/auth.ts`)

OAuth is less susceptible but could still benefit from additional protection:
```typescript
// Current - No additional protection
export const signInWithGoogle = async () => {
    await authClient.signIn.social({
        provider: "google",
        callbackURL: `${frontendUrl}/`
        // OAuth has Google's own protection
    })
}
```

### Search Results in Codebase

```bash
$ grep -ri "captcha\|turnstile\|recaptcha\|hcaptcha" src/
# No matches found
```

This confirms there is absolutely no CAPTCHA implementation in the codebase.

## Security Vulnerabilities

### Critical Risks

| Attack Type | Current Protection | Risk Level |
|-------------|-------------------|------------|
| Credential Stuffing | None | 🔴 Critical |
| Brute Force Login | None | 🔴 Critical |
| Spam Account Creation | None | 🔴 High |
| Automated Scraping | None | 🟡 Medium |
| DDoS via Auth Endpoints | None | 🔴 High |

### Attack Scenarios

1. **Credential Stuffing**: Attacker uses leaked credentials from other breaches to attempt login
2. **Account Enumeration**: Automated testing of email addresses to discover valid accounts
3. **Spam Registration**: Bots creating thousands of fake accounts
4. **Resource Exhaustion**: Flooding auth endpoints with requests

## Proposed Solution: Cloudflare Turnstile Integration

### Why Cloudflare Turnstile?

- **Privacy-friendly**: Doesn't require solving puzzles
- **User experience**: Invisible verification in most cases
- **Performance**: Lightweight and fast
- **Free tier**: Generous free usage limits
- **Better Auth Compatible**: Works with Better Auth

### Phase 1: Setup Cloudflare Turnstile

#### 1.1 Install Dependencies

```bash
npm install @marsidev/react-turnstile
# or
pnpm add @marsidev/react-turnstile
```

#### 1.2 Create Turnstile Component

```typescript
// src/components/auth/turnstile-widget.tsx
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile"
import { forwardRef, useImperativeHandle, useRef, useState } from "react"

interface TurnstileWidgetProps {
    siteKey: string
    onSuccess: (token: string) => void
    onError?: () => void
    onExpire?: () => void
}

export interface TurnstileWidgetRef {
    reset: () => void
}

export const TurnstileWidget = forwardRef<TurnstileWidgetRef, TurnstileWidgetProps>(
    ({ siteKey, onSuccess, onError, onExpire }, ref) => {
        const turnstileRef = useRef<TurnstileInstance>(null)
        const [isLoading, setIsLoading] = useState(true)

        useImperativeHandle(ref, () => ({
            reset: () => {
                turnstileRef.current?.reset()
            }
        }))

        return (
            <div className="flex justify-center my-4">
                {isLoading && (
                    <div className="h-[65px] w-[300px] animate-pulse bg-gray-100 rounded" />
                )}
                <Turnstile
                    ref={turnstileRef}
                    siteKey={siteKey}
                    onSuccess={(token) => {
                        setIsLoading(false)
                        onSuccess(token)
                    }}
                    onError={() => {
                        setIsLoading(false)
                        onError?.()
                    }}
                    onExpire={() => {
                        setIsLoading(false)
                        onExpire?.()
                    }}
                    options={{
                        theme: "light",
                        size: "normal"
                    }}
                />
            </div>
        )
    }
)

TurnstileWidget.displayName = "TurnstileWidget"
```

#### 1.3 Create Environment Configuration

```typescript
// src/config/turnstile.ts
export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || ""

// Validate configuration
if (!TURNSTILE_SITE_KEY && import.meta.env.PROD) {
    console.warn("⚠️ Turnstile site key not configured. Bot protection disabled.")
}
```

Add to `.env`:
```env
VITE_TURNSTILE_SITE_KEY=your_turnstile_site_key_here
```

### Phase 2: Integrate with Auth Forms

#### 2.1 Update Signup Form

```typescript
// src/components/auth/signup-form.tsx
import { TurnstileWidget, type TurnstileWidgetRef } from "./turnstile-widget"
import { TURNSTILE_SITE_KEY } from "@/config/turnstile"
import { useRef, useState } from "react"

interface SignupFormData {
    firstName: string
    lastName: string
    email: string
    password: string
    confirmPassword: string
}

export function SignupForm({ onSwitchToSignin }: AuthNavigationProps) {
    // Existing state...
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
    const [turnstileError, setTurnstileError] = useState<string | null>(null)
    const turnstileRef = useRef<TurnstileWidgetRef>(null)

    const onSubmit = async (data: SignupFormData) => {
        // Validate Turnstile token
        if (!turnstileToken) {
            setTurnstileError("Please complete the human verification")
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const result = await signUp.email(
                {
                    email: data.email,
                    password: data.password,
                    name: `${data.firstName} ${data.lastName}`,
                    // Pass captcha token to backend
                    callbackURL: window.location.origin
                },
                {
                    // Add turnstile token to headers
                    headers: {
                        "X-Turnstile-Token": turnstileToken
                    },
                    onSuccess: () => {
                        // Success handling...
                    },
                    onError: (ctx) => {
                        // Reset turnstile on error
                        turnstileRef.current?.reset()
                        setTurnstileToken(null)
                        setError(ctx.error?.message || "Failed to create account")
                        setIsLoading(false)
                    }
                }
            )

            // Handle result...
        } catch (err: any) {
            turnstileRef.current?.reset()
            setTurnstileToken(null)
            setError(err?.message || "An error occurred")
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full space-y-6">
            {/* ... existing form fields ... */}

            {/* Turnstile Widget - Add before submit button */}
            {TURNSTILE_SITE_KEY && (
                <div className="space-y-2">
                    <TurnstileWidget
                        ref={turnstileRef}
                        siteKey={TURNSTILE_SITE_KEY}
                        onSuccess={(token) => {
                            setTurnstileToken(token)
                            setTurnstileError(null)
                        }}
                        onError={() => {
                            setTurnstileError("Verification failed. Please try again.")
                            setTurnstileToken(null)
                        }}
                        onExpire={() => {
                            setTurnstileError("Verification expired. Please verify again.")
                            setTurnstileToken(null)
                        }}
                    />
                    {turnstileError && (
                        <p className="text-red-500 text-sm text-center">{turnstileError}</p>
                    )}
                </div>
            )}

            <Button
                type="submit"
                className="h-12 w-full bg-red-700 font-medium text-white hover:bg-red-800"
                disabled={isLoading || isSocialLoading || (TURNSTILE_SITE_KEY && !turnstileToken)}
            >
                {isLoading ? "Creating Account..." : "Sign Up"}
            </Button>

            {/* ... rest of form ... */}
        </div>
    )
}
```

#### 2.2 Update Login Form

```typescript
// src/components/auth/signin-form.tsx
import { TurnstileWidget, type TurnstileWidgetRef } from "./turnstile-widget"
import { TURNSTILE_SITE_KEY } from "@/config/turnstile"
import { useRef, useState } from "react"

export function SigninForm({ onSwitchToSignup, onForgotPassword }: AuthNavigationProps) {
    // Existing state...
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
    const [turnstileError, setTurnstileError] = useState<string | null>(null)
    const turnstileRef = useRef<TurnstileWidgetRef>(null)

    const onSubmit = async (data: SigninFormData) => {
        // Validate Turnstile token
        if (TURNSTILE_SITE_KEY && !turnstileToken) {
            setTurnstileError("Please complete the human verification")
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            await signIn.email(
                {
                    email: data.email,
                    password: data.password,
                    rememberMe: data.rememberMe
                },
                {
                    // Add turnstile token to request
                    headers: {
                        "X-Turnstile-Token": turnstileToken || ""
                    },
                    onSuccess: () => {
                        reset()
                        window.location.href = "/"
                    },
                    onError: (ctx) => {
                        // Reset turnstile on error
                        turnstileRef.current?.reset()
                        setTurnstileToken(null)
                        // ... existing error handling
                    }
                }
            )
        } catch (err: any) {
            turnstileRef.current?.reset()
            setTurnstileToken(null)
            // ... existing error handling
        }
    }

    return (
        <div className="w-full space-y-6">
            {/* ... existing form fields ... */}

            {/* Turnstile Widget - Add before submit button */}
            {TURNSTILE_SITE_KEY && (
                <div className="space-y-2">
                    <TurnstileWidget
                        ref={turnstileRef}
                        siteKey={TURNSTILE_SITE_KEY}
                        onSuccess={(token) => {
                            setTurnstileToken(token)
                            setTurnstileError(null)
                        }}
                        onError={() => {
                            setTurnstileError("Verification failed. Please try again.")
                            setTurnstileToken(null)
                        }}
                        onExpire={() => {
                            setTurnstileError("Verification expired. Please verify again.")
                            setTurnstileToken(null)
                        }}
                    />
                    {turnstileError && (
                        <p className="text-red-500 text-sm text-center">{turnstileError}</p>
                    )}
                </div>
            )}

            <Button
                type="submit"
                className="h-12 w-full bg-red-700 font-medium text-white hover:bg-red-800"
                disabled={isLoading || isSocialLoading || (TURNSTILE_SITE_KEY && !turnstileToken)}
            >
                {isLoading ? "Signing in..." : "Login"}
            </Button>

            {/* ... rest of form ... */}
        </div>
    )
}
```

### Phase 3: Backend Verification

#### 3.1 Backend Middleware

The backend needs to verify the Turnstile token:

```typescript
// Backend: src/middleware/turnstile.ts
import { Hono } from "hono"

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY

export async function verifyTurnstileToken(token: string, ip?: string): Promise<boolean> {
    if (!TURNSTILE_SECRET_KEY) {
        console.warn("Turnstile secret key not configured - skipping verification")
        return true // Skip in development
    }

    const response = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                secret: TURNSTILE_SECRET_KEY,
                response: token,
                ...(ip && { remoteip: ip })
            })
        }
    )

    const data = await response.json()
    return data.success === true
}

// Middleware for Hono
export const turnstileMiddleware = async (c: Context, next: Next) => {
    const turnstileToken = c.req.header("X-Turnstile-Token")
    
    if (!turnstileToken) {
        return c.json({ error: "Human verification required" }, 400)
    }

    const ip = c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For")
    const isValid = await verifyTurnstileToken(turnstileToken, ip)

    if (!isValid) {
        return c.json({ error: "Human verification failed" }, 400)
    }

    await next()
}
```

#### 3.2 Apply to Auth Routes

```typescript
// Backend: Apply middleware to auth routes
app.post("/api/auth/sign-up/*", turnstileMiddleware)
app.post("/api/auth/sign-in/*", turnstileMiddleware)
app.post("/api/auth/forgot-password", turnstileMiddleware)
```

### Phase 4: Additional Protections (Optional)

#### 4.1 Add to Forgot Password Form

```typescript
// src/pages/ForgotPassword.tsx
// Apply same pattern as login/signup forms
```

#### 4.2 Add Rate Limiting Indicators

```typescript
// Show rate limit warning to users
{rateLimited && (
    <Alert variant="warning">
        <AlertDescription>
            Too many attempts. Please wait before trying again.
        </AlertDescription>
    </Alert>
)}
```

## Configuration Files

### Environment Variables

```env
# .env.local (Frontend)
VITE_TURNSTILE_SITE_KEY=your_site_key_here

# .env (Backend)
TURNSTILE_SECRET_KEY=your_secret_key_here
```

### Cloudflare Turnstile Dashboard Setup

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to Turnstile
3. Create a new site:
   - **Site Name**: Artopia Art Gallery
   - **Domains**: Add your domains (localhost for dev, production domain)
   - **Widget Type**: Managed (recommended)
4. Copy the Site Key (for frontend) and Secret Key (for backend)

## Files to Create/Modify

### New Files
1. `src/components/auth/turnstile-widget.tsx`
2. `src/config/turnstile.ts`

### Modified Files
1. `src/components/auth/signup-form.tsx`
2. `src/components/auth/signin-form.tsx`
3. `src/pages/ForgotPassword.tsx`
4. `.env` files for configuration

### Package Updates
1. `package.json` - Add `@marsidev/react-turnstile`

## Testing Checklist

- [ ] Turnstile widget loads on signup page
- [ ] Turnstile widget loads on login page
- [ ] Cannot submit signup form without completing verification
- [ ] Cannot submit login form without completing verification
- [ ] Token is properly sent to backend
- [ ] Backend validates token before processing request
- [ ] Widget resets after failed login attempt
- [ ] Widget resets after failed signup attempt
- [ ] Works correctly on mobile devices
- [ ] Graceful degradation when Turnstile is unavailable

## Alternative Solutions

If Cloudflare Turnstile is not preferred:

### Google reCAPTCHA v3
```bash
npm install react-google-recaptcha-v3
```
- Pros: Well-known, invisible
- Cons: Privacy concerns, requires Google account

### hCaptcha
```bash
npm install @hcaptcha/react-hcaptcha
```
- Pros: Privacy-focused, Cloudflare integration
- Cons: May require user interaction

## Priority

**High** - Critical security vulnerability

## Estimated Effort

- Frontend Implementation: 4-6 hours
- Backend Verification: 2-4 hours
- Configuration & Testing: 2-3 hours
- Documentation: 1-2 hours

**Total: 9-15 hours**

## Security Benefits

1. **Prevents Automated Attacks**: Stops bots from mass login attempts
2. **Reduces Account Enumeration**: Slows down email harvesting
3. **Protects Against Credential Stuffing**: Adds friction to automated attacks
4. **Minimizes Spam Accounts**: Prevents bot-created accounts
5. **Reduces Server Load**: Filters out malicious traffic

---

**Status:** 🔴 Not Implemented  
**Severity:** Critical - Security Risk  
**Category:** Security / Bot Protection
