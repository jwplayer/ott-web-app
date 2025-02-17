import ReCaptcha, { type ReCAPTCHAProps } from 'react-google-recaptcha';
import { forwardRef, useEffect } from 'react';

import styles from './RecaptchaField.module.scss';

type Props = {
  siteKey: string;
  size?: ReCAPTCHAProps['size'];
};

const RecaptchaField = forwardRef<ReCaptcha, Props>(({ siteKey, size }, ref) => {
  useEffect(() => {
    const domObserver = new MutationObserver(() => {
      const iframe = document.querySelector('iframe[src^="https://www.google.com/recaptcha"][src*="bframe"]');

      if (iframe?.parentNode?.parentNode) {
        domObserver.disconnect();
        document.querySelector('#grecaptcha-challenge-container')?.appendChild(iframe?.parentNode?.parentNode);
      }
    });

    domObserver.observe(document.documentElement || document.body, { childList: true, subtree: true });
  }, []);
  return (
    <div className={styles.captcha}>
      <ReCaptcha ref={ref} sitekey={siteKey} size={size} badge="inline" theme="dark" />
      <div id="grecaptcha-challenge-container" />
    </div>
  );
});

export default RecaptchaField;
