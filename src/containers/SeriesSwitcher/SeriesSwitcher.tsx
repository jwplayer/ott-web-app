import React from 'react';
import type { RouteComponentProps } from 'react-router-dom';

import { useSeriesData } from '#src/hooks/useSeries';
import Series from '#src/screens/Series/Series';
import SeriesNew from '#src/screens/SeriesNew/SeriesNew';
import LoadingOverlay from '#src/components/LoadingOverlay/LoadingOverlay';

type Params = {
  id: string;
};

const SeriesSwitcher = (params: RouteComponentProps<Params>): JSX.Element => {
  const seriesId = params.match.params.id;

  const { isLoading, isFetching, error } = useSeriesData(seriesId);

  if (isLoading || isFetching) return <LoadingOverlay />;

  // In case we have not found series using id, we assume it is a v2.0 seriesId
  if (error?.code === 404) return <Series {...params} />;

  return <SeriesNew {...params} />;
};

export default SeriesSwitcher;
