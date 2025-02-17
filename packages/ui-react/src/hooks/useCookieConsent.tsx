import { useState, useEffect, useCallback } from 'react';
import env from '@jwp/ott-common/src/env';
import { injectScript } from '@jwp/ott-ui-react/src/utils/dom';
import { setCookie, getCookie, removeCookie } from '@jwp/ott-ui-react/src/utils/cookies';

export type ConsentState = 'accepted' | 'declined';

export function useCookieConsent() {
  const cookieName = env.APP_CONSENT_COOKIE_NAME || 'cookies.consent';
  const [isGTMLoaded, setIsGTMLoaded] = useState(false);
  const [consent, setConsent] = useState<ConsentState | null>(() => {
    const value = getCookie(cookieName);
    if (value === null) return null;
    return value === 'true' ? 'accepted' : 'declined';
  });

  const accept = useCallback(() => {
    setCookie(cookieName, 'true', 365);
    setConsent('accepted');
  }, [cookieName]);

  const decline = useCallback(() => {
    setCookie(cookieName, 'false', 365);
    setConsent('declined');
  }, [cookieName]);

  const reset = useCallback(() => {
    removeCookie(cookieName);
    setConsent(null);
  }, [cookieName]);

  useEffect(() => {
    // Wait for consent before loading GTM
    if (!env.APP_GTM_LOAD_ON_ACCEPT) return;
    if (consent === 'accepted' && !isGTMLoaded && env.APP_GTM_SCRIPT) {
      injectScript(env.APP_GTM_SCRIPT);
      setIsGTMLoaded(true);
    }
  }, [consent, isGTMLoaded]);

  return {
    isActive: !!env.APP_GTM_TAG_ID,
    isGTMLoaded,
    consent,
    reset,
    accept,
    decline,
  };
}

export default useCookieConsent;
