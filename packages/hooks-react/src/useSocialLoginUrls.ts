import { useQuery } from 'react-query';
import { getModule } from '@jwp/ott-common/src/modules/container';
import AccountController from '@jwp/ott-common/src/controllers/AccountController';

export type SocialLoginURLs = Record<string, string>;

export default function useSocialLoginUrls(url: string) {
  const accountController = getModule(AccountController);

  const urls = useQuery(['socialUrls'], () => accountController.getSocialLoginUrls(url), {
    enabled: accountController.getFeatures().hasSocialURLs,
    retry: false,
  });

  if (urls.error || !urls.data) {
    return null;
  }

  return urls.data.reduce((acc, url) => ({ ...acc, ...url }), {} as SocialLoginURLs);
}
