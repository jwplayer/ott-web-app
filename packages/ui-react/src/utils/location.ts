import { createURL, type QueryParamsArg } from '@jwp/ott-common/src/utils/urlFormatting';
import type { Location } from 'react-router-dom';

import type { AccountModals } from '../containers/AccountModal/AccountModal';

export const createURLFromLocation = (location: Location, queryParams: QueryParamsArg = {}) => {
  return createURL(`${location.pathname}${location.search || ''}`, queryParams);
};

export const modalURLFromLocation = (location: Location, u: keyof AccountModals | null, queryParams?: QueryParamsArg) => {
  return createURL(`${location.pathname}${location.search || ''}`, { u, ...queryParams });
};

// Create a full modal url including hostname, mostly for external use (e.g paypal successUrl)
export const modalURLFromWindowLocation = (u: keyof AccountModals, queryParams?: QueryParamsArg) => {
  return createURL(window.location.href, { u, ...queryParams });
};
