import { useQuery } from 'react-query';

import SocialButton, { SocialButtonVariant } from '../SocialButton/SocialButton';

import styles from './SocialButtonsList.module.scss';

import { getSocialLoginUrls } from '#src/stores/AccountController';

const SocialButtonsList = () => {
  const urls = useQuery('socialUrls', getSocialLoginUrls);

  if (urls.error || !urls.data) {
    return null;
  }

  const formattedData = urls.data.reduce(
    (acc, url) => ({
      ...acc,
      ...url,
    }),
    {} as {
      [key in SocialButtonVariant]: string;
    },
  );

  return (
    <div className={styles.socialButtonsListContainer}>
      {Object.entries(formattedData).map(([variant, url]) => (
        <SocialButton key={variant} variant={variant as SocialButtonVariant} href={url} />
      ))}
    </div>
  );
};

export default SocialButtonsList;
