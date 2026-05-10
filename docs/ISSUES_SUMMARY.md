# Art Gallery - Security and UX Issues Summary

This document provides an overview of identified security and user experience issues in the Art Gallery (Artopia) application.

## Issues Overview

| Issue # | Title | Severity | Category | Status |
|---------|-------|----------|----------|--------|
| 1 | [Terms and Policies Enforcement](#issue-1) | 🔴 High | Security/Compliance | Not Implemented |
| 2 | [Payment Page OTP Protection](#issue-2) | 🔴 Critical | Security | Not Implemented |
| 3 | [Cloudflare Bot Protection](#issue-3) | 🔴 Critical | Security | Not Implemented |
| 4 | [Dropdown Page Glitch](#issue-4) | 🟡 Medium | UX Bug | Partially Fixed |

---

## Issue 1: No Terms and Policies Agreement Enforcement {#issue-1}

**File:** [ISSUE_01_TERMS_AND_POLICIES_ENFORCEMENT.md](./ISSUE_01_TERMS_AND_POLICIES_ENFORCEMENT.md)

### Problem
New users can sign up and use the platform without accepting Terms of Service and Privacy Policy.

### Impact
- GDPR compliance violations
- Unenforceable user agreements
- Legal liability exposure

### Quick Solution
Add a required checkbox to the signup form:
```tsx
<Checkbox id="terms" required />
<Label>I agree to the Terms of Service and Privacy Policy</Label>
```

### Affected Files
- `src/components/auth/signup-form.tsx`
- `src/pages/Signup.tsx`

---

## Issue 2: Payment Pages Not Protected - No OTP {#issue-2}

**File:** [ISSUE_02_PAYMENT_PAGE_OTP_PROTECTION.md](./ISSUE_02_PAYMENT_PAGE_OTP_PROTECTION.md)

### Problem
Payment-related pages lack OTP (One-Time Password) verification for sensitive financial transactions.

### Impact
- Session hijacking can lead to unauthorized payments
- No secondary verification for financial actions
- Increased fraud risk

### Quick Solution
1. Add `ProtectedRoute` to PaymentSuccess and PaymentCancel pages
2. Implement OTP verification modal before payment processing

### Affected Files
- `src/pages/Checkout.tsx`
- `src/pages/PaymentSuccess.tsx`
- `src/pages/PaymentCancel.tsx`
- `src/pages/Settings.tsx`

---

## Issue 3: No Cloudflare "I Am Human" Check {#issue-3}

**File:** [ISSUE_03_CLOUDFLARE_TURNSTILE_BOT_PROTECTION.md](./ISSUE_03_CLOUDFLARE_TURNSTILE_BOT_PROTECTION.md)

### Problem
Login and signup pages have no bot protection, exposing them to automated attacks.

### Impact
- Credential stuffing attacks
- Brute force password attempts
- Spam account creation
- Resource exhaustion

### Quick Solution
Integrate Cloudflare Turnstile:
```bash
npm install @marsidev/react-turnstile
```

### Affected Files
- `src/components/auth/signin-form.tsx`
- `src/components/auth/signup-form.tsx`
- `src/pages/ForgotPassword.tsx`

---

## Issue 4: Dropdown Page Glitch {#issue-4}

**File:** [ISSUE_04_DROPDOWN_PAGE_GLITCH.md](./ISSUE_04_DROPDOWN_PAGE_GLITCH.md)

### Problem
Page content shifts horizontally when opening dropdown menus due to scrollbar behavior.

### Impact
- Poor user experience
- Unprofessional appearance
- Visual instability

### Quick Solution
Add to `src/index.css`:
```css
html {
  overflow-y: scroll;
  scrollbar-gutter: stable;
}

body[data-scroll-locked] {
  margin: 0 !important;
  padding-right: 0 !important;
}
```

### Affected Files
- `src/index.css`
- `src/components/mega-menu.tsx`
- `src/components/user-dropdown.tsx`

---

## Implementation Priority

### Phase 1: Critical Security (Week 1)
1. ✅ **Issue 3**: Cloudflare Turnstile - Prevents automated attacks
2. ✅ **Issue 2**: OTP Protection - Secures financial transactions

### Phase 2: Compliance (Week 2)  
3. ✅ **Issue 1**: Terms Enforcement - Legal compliance

### Phase 3: UX Improvements (Week 3)
4. ✅ **Issue 4**: Dropdown Glitch - User experience polish

---

## Total Estimated Effort

| Issue | Frontend | Backend | Testing | Total |
|-------|----------|---------|---------|-------|
| Issue 1 | 4-6h | 2-4h | 2-3h | 8-13h |
| Issue 2 | 8-12h | 8-12h | 4-6h | 20-30h |
| Issue 3 | 4-6h | 2-4h | 2-3h | 8-13h |
| Issue 4 | 3-5h | 0h | 2-3h | 5-8h |
| **Total** | **19-29h** | **12-20h** | **10-15h** | **41-64h** |

---

## Quick Start for Developers

### 1. Review Documentation
Read each issue documentation file for detailed analysis and solutions.

### 2. Set Up Development Environment
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### 3. Implement Fixes
Follow the implementation guides in each issue document.

### 4. Test Changes
Use the testing checklists provided in each document.

---

## Related Documentation

- [Radix UI Select Page Shift Fix](./RADIX_UI_SELECT_PAGE_SHIFT_FIX.md) - Previous fix for similar dropdown issues
- [README.md](../README.md) - Project overview

---

**Last Updated:** 2026-02-02  
**Document Version:** 1.0
