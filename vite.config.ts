import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Proxy all /api requests to AWS backend
      '/api': {
        target: process.env.VITE_BETTER_AUTH_URL,
        changeOrigin: true,
        secure: false,
        // CRITICAL: Forward cookies from browser to backend
        // This ensures cookies are sent with requests
        cookieDomainRewrite: {
          '*': 'localhost', // Rewrite cookie domains when coming FROM backend
        },
        cookiePathRewrite: {
          '*': '/', // Ensure cookies are available at root
        },
        // CRITICAL: Log incoming cookies to verify they're being received
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Log the cookie header being sent to backend
            const cookieHeader = req.headers.cookie;
            console.log('🔀 [Proxy] Request:', req.method, req.url);
            console.log('🍪 [Proxy] Cookies being sent:', cookieHeader || 'NONE');

            // Ensure cookie header is forwarded
            if (cookieHeader) {
              proxyReq.setHeader('Cookie', cookieHeader);
            }
          });

          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('🔀 [Proxy] Response:', proxyRes.statusCode, req.url);

            // Log cookie headers being set by backend
            const setCookie = proxyRes.headers['set-cookie'];
            if (setCookie) {
              console.log('🍪 [Proxy] Cookies received from backend:', setCookie);

              // Rewrite cookie domain to localhost for browser
              if (Array.isArray(setCookie)) {
                proxyRes.headers['set-cookie'] = setCookie.map(cookie => {
                  // Remove domain attribute or set to localhost
                  return cookie
                    .replace(/domain=[^;]+;?/gi, '')
                    .replace(/;(\s*)$/, '$1');
                });
              }
            }
          });
        },
      },
    },
  },
});