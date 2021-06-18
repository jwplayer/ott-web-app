import React, { useContext, useEffect, useMemo, useState } from 'react';
import type { RouteComponentProps } from 'react-router-dom';
import { useHistory } from 'react-router';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

import CardGrid from '../../components/CardGrid/CardGrid';
import { useFavorites } from '../../stores/FavoritesStore';
import { ConfigContext } from '../../providers/ConfigProvider';
import useBlurImageUpdater from '../../hooks/useBlurImageUpdater';
import { episodeURL } from '../../utils/formatting';
import Filter from '../../components/Filter/Filter';
import type { PlaylistItem } from '../../../types/playlist';
import VideoComponent from '../../components/Video/Video';
import useMedia from '../../hooks/useMedia';
import usePlaylist from '../../hooks/usePlaylist';
import { generateEpisodeJSONLD } from '../../utils/structuredData';
import { copyToClipboard } from '../../utils/dom';
import { filterSeries, getFiltersFromSeries } from '../../utils/collection';

import styles from './Series.module.scss';

type SeriesRouteParams = {
  id: string;
};

const Series = ({
  match: {
    params: { id },
  },
  location,
}: RouteComponentProps<SeriesRouteParams>): JSX.Element => {
  const config = useContext(ConfigContext);
  const history = useHistory();
  const { t } = useTranslation('video');
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const {
    isLoading: playlistIsLoading,
    error: playlistError,
    data: seriesPlaylist = { title: '', playlist: [] },
  } = usePlaylist(id, undefined, true, false);
  const { isLoading, error, data: item } = useMedia(searchParams.get('e') || '');
  const { data: trailerItem } = useMedia(item?.trailerId || '');

  const [seasonFilter, setSeasonFilter] = useState<string>('');
  const filters = getFiltersFromSeries(seriesPlaylist.playlist);
  const filteredPlaylist = useMemo(() => filterSeries(seriesPlaylist.playlist, seasonFilter), [
    seriesPlaylist,
    seasonFilter,
  ]);

  const { hasItem, saveItem, removeItem } = useFavorites();
  const play = searchParams.get('play') === '1';
  const feedId = searchParams.get('l');
  const posterFading: boolean = config ? config.options.posterFading === true : false;

  const [hasShared, setHasShared] = useState<boolean>(false);
  const [playTrailer, setPlayTrailer] = useState<boolean>(false);
  const enableSharing: boolean = config.options.enableSharing === true;

  useBlurImageUpdater(item);

  const isFavorited = !!item && hasItem(item);

  const startPlay = () => item && seriesPlaylist && history.push(episodeURL(seriesPlaylist, item.mediaid, true));
  const goBack = () => item && seriesPlaylist && history.push(episodeURL(seriesPlaylist, item.mediaid, false));

  const onCardClick = (item: PlaylistItem) => seriesPlaylist && history.push(episodeURL(seriesPlaylist, item.mediaid));

  const playNext = () => {
    if (!item || !seriesPlaylist) return;

    const index = seriesPlaylist.playlist.findIndex(({ mediaid }) => mediaid === item.mediaid);
    const nextItem = seriesPlaylist.playlist[index + 1];

    return nextItem && history.push(episodeURL(seriesPlaylist, nextItem.mediaid, true));
  };

  const onShareClick = (): void => {
    if (!item) return;

    if (typeof navigator.share === 'function') {
      navigator.share({ title: item.title, text: item.description, url: window.location.href });
    } else {
      copyToClipboard(window.location.href);
    }
    setHasShared(true);
    setTimeout(() => setHasShared(false), 2000);
  };

  useEffect(() => {
    if (!searchParams.has('e') && seriesPlaylist?.playlist.length) {
      history.replace(episodeURL(seriesPlaylist, seriesPlaylist.playlist[0].feedid));
    }
  }, [history, searchParams, seriesPlaylist]);

  if (isLoading || playlistIsLoading) return <p>Loading...</p>;
  if (error || playlistError) return <p>Error loading list</p>;
  if (!seriesPlaylist || !item) return <p>Can not find medium</p>;

  const pageTitle = `${item.title} - ${config.siteName}`;
  const canonicalUrl = seriesPlaylist && item ? `${window.location.origin}${episodeURL(seriesPlaylist, item.mediaid)}` : window.location.href;

  return (
    <React.Fragment>
      <Helmet>
        <title>{pageTitle}</title>
        <link rel="canonical" href={canonicalUrl} />
        <meta name="description" content={item.description} />
        <meta property="og:description" content={item.description} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:type" content="video.episode" />
        {item.image && <meta property="og:image" content={item.image?.replace(/^https:/, 'http:')} />}
        {item.image && <meta property="og:image:secure_url" content={item.image?.replace(/^http:/, 'https:')} />}
        <meta property="og:image:width" content={item.image ? '720' : ''} />
        <meta property="og:image:height" content={item.image ? '406' : ''} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={item.description} />
        <meta name="twitter:image" content={item.image} />
        <meta property="og:video" content={canonicalUrl.replace(/^https:/, 'http:')} />
        <meta property="og:video:secure_url" content={canonicalUrl.replace(/^http:/, 'https:')} />
        <meta property="og:video:type" content="text/html" />
        <meta property="og:video:width" content="1280" />
        <meta property="og:video:height" content="720" />
        {item.tags.split(',').map(tag => <meta property="og:video:tag" content={tag} key={tag} />)}
        {seriesPlaylist && item ? <script type="application/ld+json">{generateEpisodeJSONLD(seriesPlaylist, item)}</script> : null}
      </Helmet>
      <VideoComponent
        title={seriesPlaylist.title}
        item={item}
        feedId={feedId ?? undefined}
        trailerItem={trailerItem}
        play={play}
        startPlay={startPlay}
        goBack={goBack}
        onComplete={() => playNext()}
        poster={posterFading ? 'fading' : 'normal'}
        enableSharing={enableSharing}
        hasShared={hasShared}
        onShareClick={onShareClick}
        playTrailer={playTrailer}
        onTrailerClick={() => setPlayTrailer(true)}
        onTrailerClose={() => setPlayTrailer(false)}
        isFavorited={isFavorited}
        onFavoriteButtonClick={() => (isFavorited ? removeItem(item) : saveItem(item))}
        isSeries
      >
        <>
          <div className={styles.episodes}>
            <h3>{t('episodes')}</h3>
            {filters.length > 1 && (
              <Filter
                name="categories"
                value={seasonFilter}
                valuePrefix="Season "
                defaultLabel="All"
                options={filters}
                setValue={setSeasonFilter}
              />
            )}
          </div>
          <CardGrid
            playlist={filteredPlaylist}
            onCardClick={onCardClick}
            isLoading={isLoading}
            currentCardItem={item}
            currentCardLabel={t('current_episode')}
          />
        </>
      </VideoComponent>
    </React.Fragment>
  );
};

export default Series;
