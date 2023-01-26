import { reloadActiveSubscription } from './AccountController';

import useService from '#src/hooks/useService';
import { addQueryParams } from '#src/utils/formatting';

export enum NotificationsTypes {
  ACCESS_GRANTED = 'access.granted',
  ACCESS_REVOKED = 'access.revoked',
  CARD_REQUIRES_ACTION = 'payment.card.requires.action',
  SUBSCRIBE_REQUIRES_ACTION = 'subscribe.requires.action',
  FAILED = '.failed',
  SUBSCRIBE_FAILED = 'subscribe.failed',
  ACCOUNT_LOGOUT = 'account.logout',
}

export const subscribeToNotifications = async (uuid: string = '') => {
  return await useService(async ({ accountService }) => {
    return await accountService.subscribeToNotifications(uuid, async (message) => {
      if (message) {
        const notification = JSON.parse(message);
        switch (notification.type) {
          case NotificationsTypes.FAILED:
          case NotificationsTypes.SUBSCRIBE_FAILED:
            window.location.href = addQueryParams(window.location.href, { u: 'payment-error', message: notification.resource?.message });
            break;
          case NotificationsTypes.ACCESS_GRANTED:
            await reloadActiveSubscription();
            window.location.href = addQueryParams(window.location.origin, { u: 'welcome' });
            break;
          case NotificationsTypes.ACCESS_REVOKED:
            await reloadActiveSubscription();
            break;
          case NotificationsTypes.CARD_REQUIRES_ACTION:
          case NotificationsTypes.SUBSCRIBE_REQUIRES_ACTION:
            window.location.href = notification.resource?.redirect_to_url;
            break;
          default:
            break;
        }
      }
    });
  });
};
