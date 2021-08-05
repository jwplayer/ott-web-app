import type { Config } from '../../types/Config';

export const configHasCleengOffer = (config: Config): boolean => {
  if (!config?.json) return false;

  return !!config.json.cleengMonthlyOffer && !!config.json.cleengYearlyOffer;
};
