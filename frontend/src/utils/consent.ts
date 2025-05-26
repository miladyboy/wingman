/**
 * Cookie consent value type.
 */
export type CookieConsentValue = "accepted" | "refused";

/**
 * Sets the user's cookie consent value in localStorage.
 *
 * @param value - The consent value to store
 */
export function setCookieConsent(value: CookieConsentValue): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("cookie_consent", value);
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
  const value = localStorage.getItem("cookie_consent");
  if (value === "accepted" || value === "refused") return value;
  return null;
}

/**
 * Clears the user's cookie consent (for testing or reset).
 */
export function clearCookieConsent(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("cookie_consent");
  }
}
