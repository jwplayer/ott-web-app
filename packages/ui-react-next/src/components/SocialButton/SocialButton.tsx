import { useTranslation } from 'react-i18next';
import facebookIcon from '@jwp/ott-theme/assets/icons/facebook.svg';
import twitterIcon from '@jwp/ott-theme/assets/icons/twitter.svg';
import googleIcon from '@jwp/ott-theme/assets/icons/google.svg';

import styles from './SocialButton.module.scss';

export type SocialButtonVariant = 'facebook' | 'google' | 'twitter';

const socialIcons = {
  facebook: facebookIcon,
  twitter: twitterIcon,
  google: googleIcon,
};

interface SocialButtonProps {
  variant: SocialButtonVariant;
  href: string;
}

const SocialButton = ({ variant, href }: SocialButtonProps) => {
  const { t } = useTranslation('account');

  return (
    // t('login.facebook');
    // t('login.google');
    // t('login.twitter');
    <a href={href} className={styles.socialButtonContainer} aria-label={t(`login.${variant}`)}>
      <div className={styles.socialButtonIconContainer}>
        <img className={styles.socialButtonIcon} src={socialIcons[variant] ?? ''} alt={`${variant} icon`} />
      </div>
      <span className={styles.socialButtonTextContainer}>{t(`login.${variant}`)}</span>
    </a>
  );
};

export default SocialButton;
