import posthog from "posthog-js";

export function initAnalytics(): void {
  const key = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
  if (!key) return;

  posthog.init(key, {
    api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
    person_profiles: "identified_only",
  });
}
