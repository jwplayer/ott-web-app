import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTranslationKey } from '@jwp/ott-hooks-react/src/useTranslationKey';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import type { Playlist, PlaylistItem } from '@jwp/ott-common/types/playlist';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import { mediaURL } from '@jwp/ott-common/src/utils/urlFormatting';
import CardGrid from '@jwp/ott-ui-react/src/components/CardGrid/CardGrid';
import classNames from 'classnames';

import styles from './MediaSectionRelated.module.scss';

const MediaSectionRelated = ({
  className,
  item,
  playlist,
  isLoading,
}: {
  className?: string;
  item: PlaylistItem;
  playlist: Playlist | undefined;
  isLoading: boolean;
}) => {
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
    <section className={classNames(styles.relatedVideos, className)}>
      <div className={styles.relatedVideosGrid}>
        <h2 className={styles.relatedVideosGridTitle}>{(playlist?.[translationKey] as string) || playlist?.title || '\u00A0'}</h2>
      </div>
      <CardGrid
        playlist={playlist}
        isLoading={isLoading}
        accessModel={accessModel}
        isLoggedIn={isLoggedIn}
        currentCardItem={item}
        currentCardLabel={t('current_video')}
        hasSubscription={hasSubscription}
        getUrl={getUrl}
      />
    </section>
  );
};

export default MediaSectionRelated;
