import { useState, useEffect } from 'react';
import { setCookieConsent, getCookieConsent } from '../../utils/consent';
import { Button } from './button';
import posthog from 'posthog-js';
import { POSTHOG_KEY, POSTHOG_HOST } from '../../utils/env';

export default function CookieConsent({ onConsentChange }) {
  const [visible, setVisible] = useState(false);
  const bannerHeight = 64; // px, adjust if needed

  useEffect(() => {
    if (!getCookieConsent()) {
      setVisible(true);
    }
  }, []);

  const handleConsent = (value) => {
    setCookieConsent(value);
    setVisible(false);
    if (value === 'accepted') {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
      });
    } else {
      posthog.opt_out_capturing && posthog.opt_out_capturing();
    }
    if (onConsentChange) onConsentChange(value);
  };

  if (!visible) return null;

  return (
    <>
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        background: 'rgba(0,0,0,0.9)',
        color: 'white',
        padding: '1rem',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
        minHeight: `${bannerHeight}px`,
      }}>
        <span>
          We use cookies for analytics (PostHog). Please accept or refuse analytics cookies. See our privacy policy for details.
        </span>
        <Button onClick={() => handleConsent('accepted')} data-testid="cookie-accept">Accept</Button>
        <Button onClick={() => handleConsent('refused')} variant="secondary" data-testid="cookie-refuse">Refuse</Button>
      </div>
      {/* Spacer to prevent scroll jump */}
      <div style={{ height: `${bannerHeight}px` }} />
    </>
  );
} 