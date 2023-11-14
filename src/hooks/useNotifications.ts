import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { simultaneousLoginWarningKey } from '#components/LoginForm/LoginForm';
import { queryClient } from '#src/containers/QueryProvider/QueryProvider';
import { addQueryParams, removeQueryParamFromUrl } from '#src/utils/formatting';
import AccountController from '#src/stores/AccountController';
import { getModule } from '#src/modules/container';

enum NotificationsTypes {
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

export default async function useNotifications(uuid: string = '') {
  const navigate = useNavigate();

  const accountController = getModule(AccountController);
  const { hasNotifications } = accountController?.getFeatures() || {};

  useEffect(() => {
    if (!uuid || !hasNotifications) return;

    accountController?.subscribeToNotifications({
      uuid,
      onMessage: async (message) => {
        if (message) {
          const notification = JSON.parse(message);

          switch (notification.type) {
            case NotificationsTypes.FAILED:
            case NotificationsTypes.CARD_FAILED:
            case NotificationsTypes.SUBSCRIBE_FAILED:
              navigate(
                addQueryParams(window.location.pathname, {
                  u: 'payment-error',
                  message: notification.resource?.message,
                }),
              );
              break;
            case NotificationsTypes.CARD_SUCCESS:
              await queryClient.invalidateQueries('entitlements');
              navigate(removeQueryParamFromUrl('u'));
              break;
            case NotificationsTypes.SUBSCRIBE_SUCCESS:
              await accountController.reloadActiveSubscription();
              break;
            case NotificationsTypes.ACCESS_REVOKED:
              await accountController.reloadActiveSubscription();
              break;
            case NotificationsTypes.CARD_REQUIRES_ACTION:
            case NotificationsTypes.SUBSCRIBE_REQUIRES_ACTION:
              window.location.href = notification.resource?.redirect_to_url;
              break;
            case NotificationsTypes.ACCOUNT_LOGOUT:
              if (notification.resource?.reason === 'sessions_limit') {
                navigate(addQueryParams(window.location.pathname, { u: 'login', message: simultaneousLoginWarningKey }));
              } else {
                await accountController.logout();
              }
              break;
            default:
              break;
          }
        }
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountController, uuid]);
}
