import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { getModule } from '@jwp/ott-common-next/src/modules/container';
import AccountController from '@jwp/ott-common-next/src/controllers/AccountController';

export type SocialLoginURLs = Record<string, string>;

export default function useSocialLoginUrls(url: string) {
  const accountController = getModule(AccountController);

  const { data, error } = useQuery(['socialUrls', url], () => accountController.getSocialLoginUrls(url), {
    enabled: accountController.getFeatures().hasSocialURLs,
    retry: false,
  });

  const urls = useMemo(() => {
    if (!data) return null;

    return data.reduce((acc, url) => ({ ...acc, ...url }), {} as SocialLoginURLs);
  }, [data]);

  if (error || !urls) {
    return null;
  }

  return urls;
}
