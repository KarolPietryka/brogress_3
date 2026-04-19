/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_POSTHOG_KEY?: string;
  readonly VITE_PUBLIC_POSTHOG_HOST?: string;
  /** Optional JWT for local dev when `localStorage` has no `brogress.jwt`. */
  readonly VITE_DEV_JWT?: string;
  /** Production API origin (no trailing slash), e.g. https://api.example.com */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
