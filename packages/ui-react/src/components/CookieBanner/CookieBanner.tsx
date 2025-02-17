import React, { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useCookieConsent } from '@jwp/ott-ui-react/src/hooks/useCookieConsent';
import env from '@jwp/ott-common/src/env';
import { testId } from '@jwp/ott-common/src/utils/common';

import Button from '../Button/Button';
import Modal from '../Modal/Modal';
import Slide from '../Animation/Slide/Slide';
import createInjectableComponent from '../../modules/createInjectableComponent';

import styles from './CookieBanner.module.scss';

export const CookieBannerIdentifier = Symbol(`COOKIE_WALL`);

export type Props = {
  onAccept?: () => void;
  onDecline?: () => void;
  onOpen?: () => void;
  onClose?: () => void;
};

const CookieBanner: React.FC<Props> = ({ onAccept, onDecline, onOpen, onClose }) => {
  const { t } = useTranslation('cookiebanner');
  const { isActive, consent, accept, decline } = useCookieConsent();

  useEffect(() => {
    if (!isActive) return;
    if (!consent) {
      onOpen?.();
    } else {
      onClose?.();
    }
  }, [consent, isActive, onOpen, onClose]);

  const handleAcceptClick = () => {
    accept();
    onAccept?.();
  };

  const handleDeclineClick = () => {
    decline();
    onDecline?.();
  };

  if (!isActive || consent !== null) {
    return null;
  }

  // Multiple links are supported, separated by a pipe character. Usage for `consent_text`: "Read our <0>privacy policy</0> and <1>cookie policy</1>"
  const linkComponents = (env.APP_CONSENT_COOKIE_POLICY_URL || '#').split('|').map((link) => <a key={link} href={link} />);

  return (
    <Modal
      open={true}
      AnimationComponent={Slide}
      className={styles.overlay}
      role="alertdialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-description"
    >
      <div className={styles.banner}>
        <h1 className="hidden" id="cookie-banner-title">
          {t('title')}
        </h1>
        <p id="cookie-banner-description">
          <Trans
            t={t}
            components={linkComponents}
            i18nKey="consent_text"
            defaults="We use cookies to improve your experience. Do you accept the use of cookies?"
          />
        </p>
        <div className={styles.buttonBar}>
          <Button label={t('accept')} onClick={handleAcceptClick} color="primary" data-testid={testId('accept')} />
          <Button label={t('decline')} onClick={handleDeclineClick} data-testid={testId('decline')} />
        </div>
      </div>
    </Modal>
  );
};

export default createInjectableComponent(CookieBannerIdentifier, CookieBanner);
