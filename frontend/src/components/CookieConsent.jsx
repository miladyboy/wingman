import { useState, useEffect } from 'react';
import { setCookieConsent, getCookieConsent } from '../utils/consent';
import { Button } from './ui/button';
import posthog from 'posthog-js';
import { POSTHOG_KEY, POSTHOG_HOST } from '../utils/env';

export default function CookieConsent({ onConsentChange }) {
  const [visible, setVisible] = useState(false);
  const bannerHeight = 64; // px, adjust if needed

  useEffect(() => {
    const existingConsent = getCookieConsent();
    console.log('Cookie consent status:', existingConsent);
    
    if (!existingConsent) {
      setVisible(true);
    } else if (existingConsent === 'accepted') {
      console.log('PostHog: Initializing from stored consent preferences');
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
      });
      console.log('PostHog initialized with key:', POSTHOG_KEY);
    }
  }, []);

  const handleConsent = (value) => {
    console.log('User consent choice:', value);
    setCookieConsent(value);
    setVisible(false);
    
    if (value === 'accepted') {
      console.log('PostHog: Initializing analytics tracking');
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
      });
      console.log('PostHog initialized successfully');
    } else {
      console.log('PostHog: User opted out of tracking');
      posthog.opt_out_capturing && posthog.opt_out_capturing();
      console.log('PostHog tracking disabled');
    }
    
    if (onConsentChange) onConsentChange(value);
  };

  if (!visible) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 w-full bg-black/90 text-white p-4 z-[1000] flex flex-col items-center justify-center gap-4">
        <div className="w-full max-w-[1200px] flex flex-col md:flex-row items-center justify-center gap-4">
          <span className="text-center md:text-left">
            We use cookies to improve your experience. By clicking "Accept" you agree to the use of analytics cookies. 
          </span>
          <div className="flex gap-2 flex-shrink-0">
            <Button onClick={() => handleConsent('accepted')} data-testid="cookie-accept">Accept</Button>
            <Button onClick={() => handleConsent('refused')} variant="secondary" data-testid="cookie-refuse">Refuse</Button>
          </div>
        </div>
      </div>
      {/* Spacer to prevent scroll jump */}
      <div style={{ height: `${bannerHeight}px` }} />
    </>
  );
} 