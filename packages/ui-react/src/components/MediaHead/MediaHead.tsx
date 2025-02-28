import React from 'react';
import { Helmet } from 'react-helmet';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { generateMovieJSONLD } from '@jwp/ott-common/src/utils/structuredData';
import env from '@jwp/ott-common/src/env';

const MediaHead = ({ data, canonicalUrl }: { data: PlaylistItem; canonicalUrl: string }) => {
  const { config } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);
  const { siteName } = config;

  const pageTitle = `${data.title} - ${siteName}`;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <link rel="canonical" href={canonicalUrl} />
      <meta name="description" content={data.description} />
      <meta property="og:description" content={data.description} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:type" content="video.other" />
      {data.image && <meta property="og:image" content={data.image?.replace(/^https:/, 'http:')} />}
      {data.image && <meta property="og:image:secure_url" content={data.image?.replace(/^http:/, 'https:')} />}
      <meta property="og:image:width" content={data.image ? '720' : ''} />
      <meta property="og:image:height" content={data.image ? '406' : ''} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={data.description} />
      <meta name="twitter:image" content={data.image} />
      <meta property="og:video" content={canonicalUrl.replace(/^https:/, 'http:')} />
      <meta property="og:video:secure_url" content={canonicalUrl.replace(/^http:/, 'https:')} />
      <meta property="og:video:type" content="text/html" />
      <meta property="og:video:width" content="1280" />
      <meta property="og:video:height" content="720" />
      {data.tags?.split(',').map((tag) => (
        <meta property="og:video:tag" content={tag} key={tag} />
      ))}
      {data ? <script type="application/ld+json">{generateMovieJSONLD(data, env.APP_PUBLIC_URL)}</script> : null}
    </Helmet>
  );
};

export default MediaHead;
