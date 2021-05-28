import React from 'react';
import { RouteComponentProps, useLocation } from 'react-router-dom';

import Video from '../../containers/Video/Video';

type SeriesRouteParams = {
  id: string;
  episodeId: string;
};

const Series = ({
  match: {
    params: { id },
  },
}: RouteComponentProps<SeriesRouteParams>): JSX.Element => {
  const episodeId: string | null = new URLSearchParams(useLocation().search).get('episodeId');

  return <Video videoType={'series'} playlistId={id} episodeId={episodeId} />;
};

export default Series;
