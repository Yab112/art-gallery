# Fix: Localhost Request Issue in Production

## Problem

The application was making requests to `localhost` in production, causing API calls to fail. This was happening because:

1. **Vite embeds environment variables at build time** - When you build a Vite application, environment variables like `VITE_BETTER_AUTH_URL` are embedded into the JavaScript bundle during the build process.

2. **Runtime environment variables don't work** - Setting environment variables in `docker-compose.yml` or at container runtime has no effect on Vite apps because the values are already baked into the built JavaScript files.

3. **Missing build-time variables default to undefined** - If `VITE_BETTER_AUTH_URL` is not set during the Docker build, it defaults to `undefined`, and service files were falling back to localhost or causing errors.

## Solution

### 1. Centralized API Configuration

Created a new file `src/lib/api-config.ts` that provides intelligent URL handling:

```typescript
// Key features:
- Detects production vs development environment
- Provides fallbacks when environment variables are missing
- In production: defaults to window.location.origin (same origin)
- In development: defaults to localhost:3099
- Logs configuration on initialization for debugging
```

### 2. Updated All Service Files

Updated the following files to use the centralized configuration:

- `src/lib/auth.ts` - Better Auth client configuration
- `src/hooks/use-axios-auth.ts` - Axios instance configuration
- All service files in `src/services/` that make API calls:
  - `order/useCreateOrder.ts`
  - `order/useGetOrder.ts`
  - `payment/useInitializePayment.ts`
  - `payment/useVerifyPayment.ts`
  - `artist/useUpdatePaymentMethod.ts`
  - `artist/useGetPaymentMethods.ts`
  - `artist/useGetWithdrawals.ts`
  - `artist/useGetEarnings.ts`
  - `artist/useRequestWithdrawal.ts`
  - `transactions/useGetTransactionStats.ts`
  - `transactions/useGetTransactions.ts`

### 3. How It Works

**Before:**
```typescript
// Hardcoded environment variable that may be undefined at build time
const url = `${import.meta.env.VITE_BETTER_AUTH_URL}/api/orders/create`;
```

**After:**
```typescript
// Uses centralized config with intelligent fallbacks
import { getApiBaseUrl } from '@/lib/api-config';
const url = `${getApiBaseUrl()}/api/orders/create`;
```

## Deployment Instructions

### Option 1: Set Environment Variables During Build (Recommended)

When building your Docker image, pass the environment variables as build arguments:

```bash
docker build \
  --build-arg VITE_BETTER_AUTH_URL=https://your-api-domain.com \
  --build-arg VITE_SERVER_BASE_URL=https://your-api-domain.com/api \
  --build-arg VITE_FRONTEND_URL=https://your-frontend-domain.com \
  -t art-gallery-frontend:latest .
```

### Option 2: Use Same-Origin API (Recommended for Production)

If your frontend and backend are served from the same domain (e.g., using nginx as a reverse proxy):

1. **Don't set any environment variables** during build
2. The application will automatically use `window.location.origin` as the API base URL
3. Configure nginx to proxy `/api/*` requests to your backend server

Example nginx configuration:
```nginx
location /api/ {
    proxy_pass http://backend-server:3099/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

### Option 3: Development Mode (Automatic)

In development (localhost), the application automatically defaults to `http://localhost:3099` without any configuration needed.

## Verification

After deploying, check the browser console for:

```
🔧 API Configuration: {
  apiBaseUrl: "https://your-domain.com",
  serverBaseUrl: "https://your-domain.com/api",
  frontendUrl: "https://your-domain.com",
  isProduction: true,
  envVars: { ... }
}
```

This confirms the correct URLs are being used.

## Benefits of This Fix

1. ✅ **No more localhost in production** - Intelligent fallbacks prevent localhost URLs
2. ✅ **Easier deployment** - Can work with or without environment variables
3. ✅ **Better debugging** - Console logs show which URLs are being used
4. ✅ **Same-origin support** - Can serve API from same domain as frontend
5. ✅ **Development-friendly** - Still works seamlessly in local development

## Testing

The build has been tested and completes successfully:
```bash
npm run build
# ✓ built in 5.64s
```

All TypeScript files compile without errors.
