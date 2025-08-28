import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTranslationKey } from '@jwp/ott-hooks-react-next/src/useTranslationKey';
import { shallow } from '@jwp/ott-common-next/src/utils/compare';
import type { Playlist, PlaylistItem } from '@jwp/ott-common-next/types/playlist';
import { useConfigStore } from '@jwp/ott-common-next/src/stores/ConfigStore';
import { useAccountStore } from '@jwp/ott-common-next/src/stores/AccountStore';
import { mediaURL } from '@jwp/ott-common-next/src/utils/urlFormatting';
import VideoList from '@jwp/ott-ui-react-next/src/components/VideoList/VideoList';

import styles from './MediaSectionRelatedList.module.scss';

const MediaSectionRelatedList = ({ item, playlist, isLoading }: { item: PlaylistItem; playlist: Playlist | undefined; isLoading: boolean }) => {
  const { t } = useTranslation('video');
  const translationKey = useTranslationKey('title');
  const { config, accessModel } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);
  const { user, subscription } = useAccountStore(({ user, subscription }) => ({ user, subscription }), shallow);
  const { features } = config;

  const getUrl = (item: PlaylistItem) => mediaURL({ id: item.mediaid, title: item.title, playlistId: features?.recommendationsPlaylist });
  const isLoggedIn = !!user;
  const hasSubscription = !!subscription;

  if (!playlist) {
    return null;
  }

  return (
    <section className={styles.relatedVideosList}>
      <VideoList
        header={
          <div className={styles.relatedVideosListHeader}>
            <h2 className={styles.relatedVideosListTitle}>{(playlist?.[translationKey] as string) || playlist?.title}</h2>
          </div>
        }
        activeMediaId={item?.mediaid}
        activeLabel={t('current_video')}
        playlist={playlist}
        isLoading={isLoading}
        accessModel={accessModel}
        isLoggedIn={isLoggedIn}
        hasSubscription={hasSubscription}
        getUrl={getUrl}
      />
    </section>
  );
};

export default MediaSectionRelatedList;
