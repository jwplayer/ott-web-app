import React, { useEffect, useMemo } from 'react';
import type { Content } from '@jwp/ott-common/types/config';
import type { PlaylistItem } from '@jwp/ott-common/types/playlist';

import type { ScreenComponent } from '../../../../../types/screens';
import ShelfList from '../../../../containers/ShelfList/ShelfList';
import Hero from '../../../../components/Hero/Hero';
import HeroTitle from '../../../../components/Hero/HeroTitle';
import HeroDescription from '../../../../components/Hero/HeroDescription';

const parsePlaylistIds = (input: unknown): Content[] => {
  const playlistIds = typeof input === 'string' ? input.replace(/\s+/g, '').split(',') : [];

  return playlistIds.map((id) => ({ type: 'playlist', contentId: id }));
};

const MediaHub: ScreenComponent<PlaylistItem> = ({ data }) => {
  // Hub may specify multiple playlists as a CSV list of IDs or a single playlist
  const rows = useMemo(() => parsePlaylistIds(data.playlists || data.playlist), [data.playlist, data.playlists]);

  // Effects
  useEffect(() => {
    (document.scrollingElement || document.body).scroll({ top: 0 });
    (document.querySelector('#video-details button') as HTMLElement)?.focus();
  }, [data]);

  return (
    <header>
      <Hero image={data.backgroundImage}>
        <HeroTitle title={data.title} />
        <HeroDescription description={data.description} />
      </Hero>
      <ShelfList rows={rows}></ShelfList>
    </header>
  );
};

export default MediaHub;
