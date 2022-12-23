import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { useNotificationStore } from '#src/stores/NotificationStore';
import { addQueryParams } from '#src/utils/formatting';
import { addQueryParam } from '#src/utils/location';

export enum NotificationsTypes {
  ACCESS_GRANTED = 'access.granted',
  ACCESS_REVOKED = 'access.revoked',
  CARD_REQUIRES_ACTION = 'payment.card.requires.action',
  SUBSCRIBE_REQUIRES_ACTION = 'subscribe.requires.action',
  FAILED = '.failed',
  SUBSCRIBE_FAILED = 'subscribe.failed',
  ACCOUNT_LOGOUT = 'account.logout',
}
export interface Notification {
  type: NotificationsTypes;
}

const useNotifications = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const notification = useNotificationStore((state) => state);

  useEffect(() => {
    switch (notification.type) {
      case NotificationsTypes.FAILED:
      case NotificationsTypes.SUBSCRIBE_FAILED:
        navigate(
          addQueryParams(window.location.href, {
            u: 'payment-error',
            message: notification.resource?.message,
          }),
        );
        break;
      case NotificationsTypes.ACCESS_GRANTED:
        navigate(addQueryParam(location, 'u', 'welcome'));
        break;
      case NotificationsTypes.CARD_REQUIRES_ACTION:
      case NotificationsTypes.SUBSCRIBE_REQUIRES_ACTION:
        window.location.href = notification.resource?.redirect_to_url;
        break;
      default:
        break;
    }
  }, [notification]);

  return notification;
};

export default useNotifications;
