import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { useNotificationStore } from '#src/stores/NotificationStore';
import { addQueryParams } from '#src/utils/formatting';
import { addQueryParam } from '#src/utils/location';

const useNotifications = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const notification = useNotificationStore((state) => state);

  useEffect(() => {
    switch (notification.type) {
      case '.failed':
        navigate(
          addQueryParams(window.location.href, {
            u: 'paypal-error',
            message: notification.resource?.message,
          }),
        );
        break;
      case 'access.granted':
        navigate(addQueryParam(location, 'u', 'welcome'));
        break;
      case 'payment.card.requires.action':
      case 'subscribe.requires.action':
        window.location.href = notification.resource?.redirect_to_url;
        break;
      default:
        break;
    }

    //eslint-disable-next-line
  }, [notification]);

  return notification;
};

export default useNotifications;
