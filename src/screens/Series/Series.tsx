import React, { useContext, useEffect, useMemo, useState } from 'react';
import type { RouteComponentProps } from 'react-router-dom';
import { useHistory } from 'react-router';
import { Helmet } from 'react-helmet';

import CardGrid from '../../components/CardGrid/CardGrid';
import { useFavorites } from '../../stores/FavoritesStore';
import { ConfigContext } from '../../providers/ConfigProvider';
import useBlurImageUpdater from '../../hooks/useBlurImageUpdater';
import { cardUrl, episodeURL, videoUrl } from '../../utils/formatting';
import type { PlaylistItem } from '../../../types/playlist';
import VideoComponent from '../../components/Video/Video';
import PlaylistContainer from '../../containers/Playlist/PlaylistContainer';
import useMedia from '../../hooks/useMedia';
import usePlaylist from '../../hooks/usePlaylist';
import { copyToClipboard } from '../../utils/dom';

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
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const { isLoading: playlistIsLoading, error: playlistError, data: seriesPlaylist } = usePlaylist(
    id,
    undefined,
    true,
    false,
  );
  const { isLoading, error, data: item } = useMedia(searchParams.get('e') || '');
  const { data: trailerItem } = useMedia(item?.trailerId || '');

  const { hasItem, saveItem, removeItem } = useFavorites();
  const play = searchParams.get('play') === '1';
  const posterFading: boolean = config ? config.options.posterFading === true : false;

  const [hasShared, setHasShared] = useState<boolean>(false);
  const [playTrailer, setPlayTrailer] = useState<boolean>(false);
  const enableSharing: boolean = config.options.enableSharing === true;

  useBlurImageUpdater(item);

  const isFavorited = !!item && hasItem(item);

  const startPlay = () => item && history.push(videoUrl(item, searchParams.get('r'), true));
  const goBack = () => item && history.push(videoUrl(item, searchParams.get('r'), false));

  const onCardClick = (item: PlaylistItem) => history.push(cardUrl(item));

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

  return (
    <React.Fragment>
      <Helmet>
        <title>
          {item.title} - {config.siteName}
        </title>
        <meta name="description" content={item.description} />
        <meta property="og:description" content={item.description} />
        <meta property="og:title" content={`${item.title} - ${config.siteName}`} />
        <meta property="og:type" content="video.other" />
        {item.image && <meta property="og:image" content={item.image?.replace(/^https:/, 'http:')} />}
        {item.image && <meta property="og:image:secure_url" content={item.image?.replace(/^http:/, 'https:')} />}
        <meta property="og:image:width" content={item.image ? '720' : ''} />
        <meta property="og:image:height" content={item.image ? '406' : ''} />
        <meta name="twitter:title" content={`${item.title} - ${config.siteName}`} />
        <meta name="twitter:description" content={item.description} />
        <meta name="twitter:image" content={item.image} />
        <meta property="og:video" content={window.location.href} />
        <meta property="og:video:secure_url" content={window.location.href} />
        <meta property="og:video:type" content="text/html" />
        <meta property="og:video:width" content="1280" />
        <meta property="og:video:height" content="720" />
        {item.tags.split(',').map((tag) => (
          <meta property="og:video:tag" content={tag} key={tag} />
        ))}
      </Helmet>
      <VideoComponent
        item={item}
        trailerItem={trailerItem}
        play={play}
        startPlay={startPlay}
        goBack={goBack}
        poster={posterFading ? 'fading' : 'normal'}
        enableSharing={enableSharing}
        hasShared={hasShared}
        onShareClick={onShareClick}
        playTrailer={playTrailer}
        onTrailerClick={() => setPlayTrailer(true)}
        onTrailerClose={() => setPlayTrailer(false)}
        isFavorited={isFavorited}
        onFavoriteButtonClick={() => (isFavorited ? removeItem(item) : saveItem(item))}
      >
        <PlaylistContainer playlistId={id}>
          {({ playlist }) => <CardGrid playlist={playlist.playlist} onCardClick={onCardClick} isLoading={false} />}
        </PlaylistContainer>
      </VideoComponent>
    </React.Fragment>
  );
};

export default Series;
