import { useEffect, useState } from 'react';

import styles from './SocialButton.module.scss';

export type SocialButtonVariant = 'facebook' | 'google' | 'twitter';

interface SocialButtonProps {
  variant: SocialButtonVariant;
  onClick: () => void;
}

const SocialButton = ({ variant, onClick }: SocialButtonProps) => {
  const [icon, setIcon] = useState<string | null>(null);

  useEffect(() => {
    const getIcon = async () => {
      const iconSvg = await (import(`../../assets/icons/${variant}.svg`) as Promise<{ default: string }>);
      setIcon(iconSvg.default);
    };
    getIcon();
  }, [variant]);

  return (
    <div onClick={onClick} className={styles.socialButtonContainer}>
      <img src={icon ?? ''} alt={`${variant} icon`} />
    </div>
  );
};

export default SocialButton;
