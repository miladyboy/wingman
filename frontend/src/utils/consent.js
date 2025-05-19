export function setCookieConsent(value) {
  localStorage.setItem('cookie_consent', value);
}

export function getCookieConsent() {
  return localStorage.getItem('cookie_consent');
} 