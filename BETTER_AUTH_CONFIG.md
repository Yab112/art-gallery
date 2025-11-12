# Better Auth Configuration Guide

## Overview

This project uses Better Auth for authentication on both backend and frontend.

## Backend Configuration

### Location

`art-gallery-backend/src/auth.ts`

### Key Settings

1. **Base URL**: `http://localhost:3000/api/auth` (or from `BETTER_AUTH_URL` env var)
2. **Trusted Origins**: Configured for localhost and production URLs
3. **Database**: Uses Prisma adapter with PostgreSQL
4. **Authentication Methods**:
   - Email/Password (enabled)
   - Google OAuth (configured)
   - Email verification (enabled)
   - Two-Factor Authentication (enabled)

### Environment Variables Needed

```env
# Backend
BETTER_AUTH_URL=http://localhost:3000/api/auth
BETTER_AUTH_SECRET=your-secret-key-here
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# Google OAuth (optional)
SERVER_GOOGLE_CLIENT_ID=your-google-client-id
SERVER_GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Mounting in NestJS

Better Auth is mounted at `/api/auth/*` in `main.ts`:

```typescript
server.all("/api/auth/*", toNodeHandler(auth));
```

## Frontend Configuration

### Location

`art-gallery/src/lib/auth.ts`

### Key Settings

1. **Base URL**: Points to backend Better Auth endpoint
2. **Credentials**: Cookies enabled for authentication

### Environment Variables Needed

```env
# Frontend (.env or .env.local)
VITE_BETTER_AUTH_URL=http://localhost:3000/api/auth
VITE_API_URL=http://localhost:3000/api
```

### Usage in Components

```typescript
import { signIn, signUp, signOut, useSession } from "@/lib/auth";

// Sign in
const result = await signIn.email({
  email: "user@example.com",
  password: "password123",
});

// Sign up
const result = await signUp.email({
  email: "user@example.com",
  password: "password123",
  name: "John Doe",
});

// Get session
const { data: session } = useSession();

// Sign out
await signOut();
```

## Features Configured

1. ✅ Email/Password Authentication
2. ✅ Email Verification
3. ✅ Password Reset
4. ✅ Google OAuth (configured, needs credentials)
5. ✅ Two-Factor Authentication
6. ✅ Custom Session (includes user role)
7. ✅ Rate Limiting
8. ✅ Cookie-based Authentication

## Important Notes

1. **Cookies**: Better Auth uses HTTP-only cookies for security. Make sure:

   - `withCredentials: true` is set in axios config
   - CORS is configured to allow credentials
   - SameSite cookie settings are correct

2. **CORS**: Backend CORS must allow:

   - Frontend origin
   - Credentials: true
   - Proper headers

3. **Session Management**: Better Auth handles sessions automatically via cookies. No need to manually manage tokens.

4. **API Requests**: Axios interceptor automatically includes session token if available, but cookies are the primary auth method.

## Testing

1. Start backend: `cd art-gallery-backend && pnpm start:dev`
2. Start frontend: `cd art-gallery && pnpm dev`
3. Navigate to signup/signin forms
4. Test authentication flow

## Troubleshooting

1. **CORS Errors**: Check `trustedOrigins` in backend `auth.ts`
2. **Cookie Issues**: Verify `sameSite`, `secure`, and `partitioned` settings
3. **Session Not Persisting**: Check cookie settings and CORS configuration
4. **401 Errors**: Verify Better Auth is mounted correctly at `/api/auth/*`
