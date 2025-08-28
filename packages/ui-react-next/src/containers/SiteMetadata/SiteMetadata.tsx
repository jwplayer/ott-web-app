import { Helmet } from 'react-helmet';
import React from 'react';
import { useConfigStore } from '@jwp/ott-common-next/src/stores/ConfigStore';
import { shallow } from '@jwp/ott-common-next/src/utils/compare';
import { useTranslation } from 'react-i18next';

const SiteMetadata = () => {
  const { t } = useTranslation('common');
  const { siteName, description } = useConfigStore(({ config }) => config, shallow);
  const metaDescription = description || t('default_description');

  return (
    <Helmet>
      <title>{siteName}</title>
      <meta name="description" content={metaDescription} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:title" content={siteName} />
      <meta name="twitter:title" content={siteName} />
      <meta name="twitter:description" content={metaDescription} />
    </Helmet>
  );
};

export default SiteMetadata;
