import {
  COOKIE_CONSENT_KEY,
  setCookieConsent,
  getCookieConsent,
  clearCookieConsent,
  isCookieConsentSet,
  type CookieConsentValue,
} from '../consent';

describe('consent utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('setCookieConsent and getCookieConsent', () => {
    it('stores and retrieves the consent value', () => {
      setCookieConsent('accepted');
      expect(localStorage.getItem(COOKIE_CONSENT_KEY)).toBe('accepted');
      expect(getCookieConsent()).toBe('accepted');
    });

    it('returns null for invalid values', () => {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'maybe');
      expect(getCookieConsent()).toBeNull();
    });
  });

  describe('clearCookieConsent', () => {
    it('removes the consent key from storage', () => {
      setCookieConsent('refused');
      clearCookieConsent();
      expect(localStorage.getItem(COOKIE_CONSENT_KEY)).toBeNull();
    });
  });

  describe('isCookieConsentSet', () => {
    it('detects when consent is stored', () => {
      expect(isCookieConsentSet()).toBe(false);
      setCookieConsent('accepted');
      expect(isCookieConsentSet()).toBe(true);
    });
  });
});
