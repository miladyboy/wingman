import { render, screen, fireEvent } from '@testing-library/react';
import * as consentUtils from '../../../utils/consent';

// Mock env.js exports
jest.mock('../../../utils/env', () => ({
  POSTHOG_KEY: 'test-key',
  POSTHOG_HOST: 'https://test.host',
}));

import CookieConsent from '../CookieConsent';

// Mock posthog
jest.mock('posthog-js', () => ({
  init: jest.fn(),
  opt_out_capturing: jest.fn(),
}));

describe('CookieConsent', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.spyOn(consentUtils, 'getCookieConsent').mockReturnValue(null);
    jest.spyOn(consentUtils, 'setCookieConsent').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the consent banner if no consent is set', () => {
    render(<CookieConsent />);
    expect(screen.getByText(/We use cookies for analytics/i)).toBeInTheDocument();
    expect(screen.getByTestId('cookie-accept')).toBeInTheDocument();
    expect(screen.getByTestId('cookie-refuse')).toBeInTheDocument();
  });

  it('accepts consent and hides the banner', () => {
    const setConsent = jest.spyOn(consentUtils, 'setCookieConsent');
    render(<CookieConsent />);
    fireEvent.click(screen.getByTestId('cookie-accept'));
    expect(setConsent).toHaveBeenCalledWith('accepted');
    expect(screen.queryByText(/We use cookies for analytics/i)).not.toBeInTheDocument();
  });

  it('refuses consent and hides the banner', () => {
    const setConsent = jest.spyOn(consentUtils, 'setCookieConsent');
    render(<CookieConsent />);
    fireEvent.click(screen.getByTestId('cookie-refuse'));
    expect(setConsent).toHaveBeenCalledWith('refused');
    expect(screen.queryByText(/We use cookies for analytics/i)).not.toBeInTheDocument();
  });
}); 