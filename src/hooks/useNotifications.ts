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
    if (notification.type?.endsWith('.failed')) {
      navigate(
        addQueryParams(window.location.href, {
          u: 'paypal-error',
          message: (notification.resource as Error)?.message,
        }),
      );
    } else if (notification.type === 'access.granted') {
      navigate(addQueryParam(location, 'u', 'welcome'));
    }

    //eslint-disable-next-line
  }, [notification]);

  return notification;
};

export default useNotifications;
