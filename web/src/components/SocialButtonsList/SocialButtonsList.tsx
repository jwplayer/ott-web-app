import { useQuery } from 'react-query';
import AccountController from '@jwplayer/ott-common/src/stores/AccountController';
import { getModule } from '@jwplayer/ott-common/src/modules/container';

import SocialButton, { SocialButtonVariant } from '../SocialButton/SocialButton';

import styles from './SocialButtonsList.module.scss';

const SocialButtonsList = () => {
  const accountController = getModule(AccountController);

  const urls = useQuery('socialUrls', accountController.getSocialLoginUrls);

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
