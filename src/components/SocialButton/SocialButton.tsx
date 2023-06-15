import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './SocialButton.module.scss';

export type SocialButtonVariant = 'facebook' | 'google' | 'twitter';

interface SocialButtonProps {
  variant: SocialButtonVariant;
  href: string;
}

const SocialButton = ({ variant, href }: SocialButtonProps) => {
  const [icon, setIcon] = useState<string | null>(null);

  const { t } = useTranslation('account');

  useEffect(() => {
    const getIcon = async () => {
      const iconSvg = await (import(`../../assets/icons/${variant}.svg`) as Promise<{ default: string }>);
      setIcon(iconSvg.default);
    };
    getIcon();
  }, [variant]);

  return (
    // t('login.facebook');
    // t('login.google');
    // t('login.twitter');
    <a href={href} className={styles.socialButtonContainer} aria-label={t(`login.${variant}`)}>
      <div className={styles.socialButtonIconContainer}>
        <img className={styles.socialButtonIcon} src={icon ?? ''} alt={`${variant} icon`} />
      </div>
      <span className={styles.socialButtonTextContainer}>{t(`login.${variant}`)}</span>
    </a>
  );
};

export default SocialButton;
