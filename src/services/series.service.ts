import { addQueryParams } from '../utils/formatting';
import { getDataOrThrow } from '../utils/api';
import { API_BASE_URL } from '../config';

import type { Series, GetSeriesParams } from '#types/series';

/**
 * Get series by id
 * @param {string} id
 * @param params
 */
export const getSeries = async (id?: string, params: GetSeriesParams = {}): Promise<Series | undefined> => {
  if (!id) {
    return undefined;
  }

  const pathname = `/apps/series/${id}`;
  const url = addQueryParams(`${API_BASE_URL}${pathname}`, params);
  const response = await fetch(url);
  const data = await getDataOrThrow(response);

  return data;
};
