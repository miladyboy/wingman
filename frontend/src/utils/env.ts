let apiBase = '';
let POSTHOG_KEY = '';
let POSTHOG_HOST = '';
try {
  apiBase = import.meta.env.VITE_BACKEND_URL || '';
  POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY || '';
  POSTHOG_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST || '';
} catch {
  apiBase = process.env.VITE_BACKEND_URL || '';
  POSTHOG_KEY = process.env.VITE_PUBLIC_POSTHOG_KEY || '';
  POSTHOG_HOST = process.env.VITE_PUBLIC_POSTHOG_HOST || '';
}
export { apiBase, POSTHOG_KEY, POSTHOG_HOST };
export default apiBase; 