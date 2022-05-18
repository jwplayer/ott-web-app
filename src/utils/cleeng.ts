import type { AccessModel } from '../../types/Config';

export const isAllowedToWatch = (accessModel: AccessModel, isLoggedIn: boolean, itemRequiresSubscription: boolean, hasSubscription: boolean): boolean =>
  accessModel === 'AVOD' ||
  (accessModel === 'AUTHVOD' && (isLoggedIn || !itemRequiresSubscription)) ||
  (accessModel === 'SVOD' && (hasSubscription || !itemRequiresSubscription));

export const filterCleengMediaOffers = (productIds: string): string[] => {
  return productIds
    .split(',')
    .reduce<string[]>((ids, productId) => (productId?.indexOf('cleeng:') === 0 ? [...ids, productId.replace('cleeng:', '')] : ids), []);
};
