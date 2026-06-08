import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
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
          target: env.VITE_BACKEND_URL,
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
            const proxyDebug = env.VITE_PROXY_DEBUG === 'true'

            proxy.on('proxyReq', (proxyReq, req, _res) => {
              if (proxyDebug) {
                const cookieHeader = req.headers.cookie as string | undefined
                const hasBetterAuth = cookieHeader?.includes('better-auth.session_token')
                console.log('🔀 [Proxy] Request:', req.method, req.url, hasBetterAuth ? '(session ✓)' : '(no session)')
              }
            })

            proxy.on('proxyRes', (proxyRes, req, _res) => {
              if (proxyDebug) {
                console.log('🔀 [Proxy] Response:', proxyRes.statusCode, req.url)
              }

              const setCookie = proxyRes.headers['set-cookie']
              if (setCookie) {
                if (Array.isArray(setCookie)) {
                  proxyRes.headers['set-cookie'] = setCookie.map((cookie) =>
                    cookie.replace(/domain=[^;]+;?/gi, '').replace(/;(\s*)$/, '$1'),
                  )
                }
              }
            })
          },
        },
      },
    },
  };
});
