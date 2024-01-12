import { createURL } from '@jwp/ott-common/src/utils/urlFormatting';
import type { Location } from 'react-router-dom';

import type { AccountModals } from '../containers/AccountModal/AccountModal';

export const modalURL = (location: Location, u: keyof AccountModals | null, queryParams?: { [key: string]: string | number | string[] | undefined | null }) => {
  return createURL(location.pathname, { u, ...queryParams }, location.search);
};
