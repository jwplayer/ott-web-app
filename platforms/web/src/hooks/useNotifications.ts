import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { getModule } from '@jwp/ott-common/src/modules/container';
import AccountController from '@jwp/ott-common/src/stores/AccountController';
import { queryClient } from '@jwp/ott-common/src/queryClient';
import { simultaneousLoginWarningKey } from '@jwp/ott-common/src/constants';
import { modalURLFromLocation } from '@jwp/ott-ui-react/src/utils/location';

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

export default function useNotifications(uuid: string = '') {
  const navigate = useNavigate();
  const location = useLocation();

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
              navigate(modalURLFromLocation(location, 'payment-error', { message: notification.resource?.message }));
              break;
            case NotificationsTypes.CARD_SUCCESS:
              await queryClient.invalidateQueries(['entitlements']);
              navigate(modalURLFromLocation(location, null));
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
                navigate(modalURLFromLocation(location, 'login', { message: simultaneousLoginWarningKey }));
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
