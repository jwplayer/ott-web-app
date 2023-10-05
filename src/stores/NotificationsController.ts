import type { NavigateFunction } from 'react-router';

import { logout, reloadActiveSubscription } from './AccountController';

import useService from '#src/hooks/useService';
import { addQueryParams, removeQueryParamFromUrl } from '#src/utils/formatting';
import { simultaneousLoginWarningKey } from '#src/components/LoginForm/LoginForm';
import { queryClient } from '#src/containers/QueryProvider/QueryProvider';

export enum NotificationsTypes {
  ACCESS_REVOKED = 'access.revoked',
  CARD_REQUIRES_ACTION = 'payment.card.requires.action',
  CARD_FAILED = 'payment.card.failed',
  CARD_SUCCESS = 'payment.card.success',
  SUBSCRIBE_REQUIRES_ACTION = 'subscribe.requires.action',
  FAILED = '.failed',
  SUBSCRIBE_FAILED = 'subscribe.failed',
  SUBSCRIBE_SUCCESS = 'subscribe.success',
  ACCOUNT_LOGOUT = 'account.logout',
}

export const subscribeToNotifications = async (uuid: string = '', navigateTo: NavigateFunction) => {
  return await useService(async ({ accountService }) => {
    return await accountService.subscribeToNotifications(uuid, async (message) => {
      if (message) {
        const notification = JSON.parse(message);

        switch (notification.type) {
          case NotificationsTypes.FAILED:
          case NotificationsTypes.CARD_FAILED:
          case NotificationsTypes.SUBSCRIBE_FAILED:
            navigateTo(addQueryParams(window.location.pathname, { u: 'payment-error', message: notification.resource?.message }));
            break;
          case NotificationsTypes.CARD_SUCCESS:
            await queryClient.invalidateQueries('entitlements');
            navigateTo(removeQueryParamFromUrl('u'));
            break;
          case NotificationsTypes.SUBSCRIBE_SUCCESS:
            await reloadActiveSubscription();
            break;
          case NotificationsTypes.ACCESS_REVOKED:
            await reloadActiveSubscription();
            break;
          case NotificationsTypes.CARD_REQUIRES_ACTION:
          case NotificationsTypes.SUBSCRIBE_REQUIRES_ACTION:
            window.location.href = notification.resource?.redirect_to_url;
            break;
          case NotificationsTypes.ACCOUNT_LOGOUT:
            if (notification.resource?.reason === 'sessions_limit') {
              navigateTo(addQueryParams(window.location.pathname, { u: 'login', message: simultaneousLoginWarningKey }));
            } else {
              await logout();
            }
            break;
          default:
            break;
        }
      }
    });
  });
};
