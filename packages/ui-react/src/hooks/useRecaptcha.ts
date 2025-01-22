import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import useEventCallback from '@jwp/ott-hooks-react/src/useEventCallback';
import { useRef } from 'react';
import type { ReCAPTCHA } from 'react-google-recaptcha';

const useRecaptcha = () => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const captchaSiteKey = useConfigStore(({ config }) => (config.custom?.captchaSiteKey ? (config.custom?.captchaSiteKey as string) : undefined));
  const getCaptchaValue = useEventCallback(async () => (captchaSiteKey ? (await recaptchaRef.current?.executeAsync()) || undefined : undefined));

  return { recaptchaRef, captchaSiteKey, getCaptchaValue };
};

export default useRecaptcha;
