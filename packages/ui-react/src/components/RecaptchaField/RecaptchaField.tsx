import ReCaptcha from 'react-google-recaptcha';
import { forwardRef } from 'react';

import styles from './RecaptchaField.module.scss';

type Props = {
  siteKey: string;
};

const RecaptchaField = forwardRef<ReCaptcha, Props>(({ siteKey }, ref) => {
  return (
    <div className={styles.captcha}>
      <ReCaptcha ref={ref} sitekey={siteKey} size={'invisible'} badge="inline" theme="dark" />
    </div>
  );
});

export default RecaptchaField;
