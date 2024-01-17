import type { SocialLoginURLs } from '@jwp/ott-hooks-react/src/useSocialLoginUrls';

import SocialButton, { type SocialButtonVariant } from '../SocialButton/SocialButton';

import styles from './SocialButtonsList.module.scss';

const SocialButtonsList = ({ socialLoginURLs }: { socialLoginURLs: SocialLoginURLs | null }) => {
  if (!socialLoginURLs) {
    return null;
  }

  return (
    <div className={styles.socialButtonsListContainer}>
      {Object.entries(socialLoginURLs).map(([variant, url]) => (
        <SocialButton key={variant} variant={variant as SocialButtonVariant} href={url} />
      ))}
    </div>
  );
};

export default SocialButtonsList;
