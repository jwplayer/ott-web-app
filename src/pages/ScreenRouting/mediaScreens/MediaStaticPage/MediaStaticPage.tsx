import React from 'react';
import { Helmet } from 'react-helmet';
import shallow from 'zustand/shallow';

import styles from './MediaStaticPage.module.scss';

import MarkdownComponent from '#components/MarkdownComponent/MarkdownComponent';
import { useConfigStore } from '#src/stores/ConfigStore';
import { mediaURL } from '#src/utils/formatting';
import type { ScreenComponent } from '#types/screens';
import type { PlaylistItem } from '#types/playlist';

const MediaStaticPage: ScreenComponent<PlaylistItem> = ({ data }) => {
  const { config } = useConfigStore(({ config }) => ({ config }), shallow);
  const { siteName } = config;
  const pageTitle = `${data.title} - ${siteName}`;
  const canonicalUrl = data ? `${window.location.origin}${mediaURL({ media: data })}` : window.location.href;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta name="twitter:title" content={pageTitle} />
      </Helmet>
      <div className={styles.mediaStaticPage}>
        <MarkdownComponent markdownString={data.markdown || data.description} />
      </div>
    </>
  );
};

export default MediaStaticPage;
