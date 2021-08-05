import type { AccessModel } from '../../types/Config';

export const isAllowedToWatch = (
  accessModel: AccessModel,
  isLoggedIn: boolean,
  itemRequiresSubscription: boolean,
  hasSubscription: boolean,
): boolean =>
  accessModel === 'AVOD' ||
  (accessModel === 'AUTHVOD' && (isLoggedIn || !itemRequiresSubscription)) ||
  (accessModel === 'SVOD' && (hasSubscription || !itemRequiresSubscription));
