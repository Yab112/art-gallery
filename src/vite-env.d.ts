/// <reference types="vite/client" />

declare const global: {
  basename: string
}

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string
  readonly VITE_SERVER_BASE_URL: string
  readonly VITE_BETTER_AUTH_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
