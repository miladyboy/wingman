/**
 * Cookie consent value type.
 */
export type CookieConsentValue = "accepted" | "refused";

/**
 * Local storage key used to persist cookie consent
 */
export const COOKIE_CONSENT_KEY = "cookie_consent";

/**
 * Sets the user's cookie consent value in localStorage.
 *
 * @param value - The consent value to store
 */
export function setCookieConsent(value: CookieConsentValue): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(COOKIE_CONSENT_KEY, value);
  }
}

/**
 * Gets the user's cookie consent value from localStorage.
 * Only returns 'accepted' or 'refused', otherwise returns null.
 *
 * @returns The stored consent value or null if not set or invalid
 */
export function getCookieConsent(): CookieConsentValue | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (value === "accepted" || value === "refused") return value;
  return null;
}

/**
 * Clears the user's cookie consent (for testing or reset).
 */
export function clearCookieConsent(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
  }
}

/**
 * Checks if a cookie consent value is stored.
 */
export function isCookieConsentSet(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(COOKIE_CONSENT_KEY) !== null;
}
