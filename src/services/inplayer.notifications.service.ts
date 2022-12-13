import InPlayer from '@inplayer-org/inplayer.js';

import { reloadActiveSubscription, logout } from '#src/stores/AccountController';

interface Notification {
  type: NotificationsTypes;
}

export enum NotificationsTypes {
  ACCESS_GRANTED = 'access.granted',
  ACCESS_REVOKED = 'access.revoked',
  SUBSCRIBE_SUCCESS = 'subscribe.success',
  SUBSCRIBE_FAILED = 'subscribe.failed',
  PAYMENT_CARD_SUCCESS = 'payment.card.success',
  PAYMENT_CARD_FAILED = 'payment.card.failed',
  PAYMENT_CARD_REQUIRES_ACTION = 'payment.card.requires.action',
  ACCOUNT_LOGOUT = 'account.logout',
}

const handleLogout = async () => {
  await logout();
};

const handleAccess = async () => {
  await reloadActiveSubscription();
};

const handleFailedPayment = async () => {
  return;
};

const handleActionStep = async () => {
  return;
};

const notifications: Record<NotificationsTypes, Array<() => Promise<void>>> = {
  [NotificationsTypes.ACCESS_GRANTED]: [handleAccess],
  [NotificationsTypes.ACCESS_REVOKED]: [handleAccess],
  [NotificationsTypes.SUBSCRIBE_SUCCESS]: [handleAccess],
  [NotificationsTypes.SUBSCRIBE_FAILED]: [handleFailedPayment],
  [NotificationsTypes.PAYMENT_CARD_SUCCESS]: [handleAccess],
  [NotificationsTypes.PAYMENT_CARD_FAILED]: [handleFailedPayment],
  [NotificationsTypes.PAYMENT_CARD_REQUIRES_ACTION]: [handleActionStep],
  [NotificationsTypes.ACCOUNT_LOGOUT]: [handleLogout],
};

export const subscribeToNotifications = (uuid: string = '') => {
  if (!InPlayer.Notifications.isSubscribed()) {
    InPlayer.subscribe(uuid, {
      onMessage: function (message) {
        const notification = JSON.parse(message) as Notification;
        notifications[notification.type]?.forEach((handler) => {
          handler?.();
        });
      },
      onOpen: () => true,
    });
  }
};
