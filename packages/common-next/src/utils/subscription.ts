import type { Subscription } from '../../types/subscription';

export const determineSwitchDirection = (subscription: Subscription | null) => {
  const currentPeriod = subscription?.period;

  if (currentPeriod === 'month') return 'upgrade';
  if (currentPeriod === 'year') return 'downgrade';

  return 'upgrade'; // Default to 'upgrade' if the period is not 'month' or 'year'
};
