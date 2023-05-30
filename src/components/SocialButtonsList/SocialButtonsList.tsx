import SocialButton, { SocialButtonVariant } from '../SocialButton/SocialButton';

import styles from './SocialButtonsList.module.scss';

type SocialButtonsListProps = {
  buttonProps: {
    [key in SocialButtonVariant]: {
      onClick: () => void;
    };
  };
};

const SocialButtonsList = ({ buttonProps }: SocialButtonsListProps) => {
  const variants: SocialButtonVariant[] = ['facebook', 'google', 'twitter'];
  return (
    <div className={styles.socialButtonsListContainer}>
      {variants.map((variant) => (
        <SocialButton key={variant} variant={variant} onClick={buttonProps[variant].onClick} />
      ))}
    </div>
  );
};

export default SocialButtonsList;
