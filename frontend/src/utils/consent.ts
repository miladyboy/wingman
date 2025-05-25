/**
 * Sets the user's cookie consent value in localStorage.
 * @param {"accepted"|"refused"} value
 */
export function setCookieConsent(value) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cookie_consent', value);
  }
}

/**
 * Gets the user's cookie consent value from localStorage.
 * Only returns 'accepted' or 'refused', otherwise returns null.
 * @returns {"accepted"|"refused"|null}
 */
export function getCookieConsent() {
  if (typeof window === 'undefined') return null;
  const value = localStorage.getItem('cookie_consent');
  if (value === 'accepted' || value === 'refused') return value;
  return null;
}

/**
 * Clears the user's cookie consent (for testing or reset).
 */
export function clearCookieConsent() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cookie_consent');
  }
} 