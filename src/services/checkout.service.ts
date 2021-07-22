import type { GetOffer } from '../../types/checkout';

import { get } from './cleeng.service';

export const getOffer: GetOffer = async (payload, sandbox) => {
  return get(sandbox, `/offers/${payload.offerId}`, JSON.stringify(payload));
};
