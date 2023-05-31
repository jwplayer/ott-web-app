import { useEffect, useState } from 'react';

import styles from './SocialButton.module.scss';

export type SocialButtonVariant = 'facebook' | 'google' | 'twitter';

interface SocialButtonProps {
  variant: SocialButtonVariant;
  href: string;
}

const SocialButton = ({ variant, href }: SocialButtonProps) => {
  const [icon, setIcon] = useState<string | null>(null);

  useEffect(() => {
    const getIcon = async () => {
      const iconSvg = await (import(`../../assets/icons/${variant}.svg`) as Promise<{ default: string }>);
      setIcon(iconSvg.default);
    };
    getIcon();
  }, [variant]);

  return (
    <a href={href} className={styles.socialButtonContainer}>
      <div className={styles.socialButtonIconContainer}>
        <img className={styles.socialButtonIcon} src={icon ?? ''} alt={`${variant} icon`} />
      </div>
      <span className={styles.socialButtonTextContainer}>Sign in with {variant.charAt(0).toUpperCase() + variant.slice(1)}</span>
    </a>
  );
};

export default SocialButton;
