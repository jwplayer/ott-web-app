import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format, fromUnixTime } from 'date-fns';
import { useLocation, useNavigate } from 'react-router';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import AccountController from '@jwp/ott-common/src/stores/AccountController';
import { modalURLFromLocation } from '@jwp/ott-ui-react/src/utils/location';

import CancelSubscriptionForm from '../../../components/CancelSubscriptionForm/CancelSubscriptionForm';
import LoadingOverlay from '../../../components/LoadingOverlay/LoadingOverlay';
import SubscriptionCancelled from '../../../components/SubscriptionCancelled/SubscriptionCancelled';
import { useAriaAnnouncer } from '../../AnnouncementProvider/AnnoucementProvider';

const CancelSubscription = () => {
  const accountController = getModule(AccountController);

  const { t, i18n } = useTranslation('account');
  const announce = useAriaAnnouncer();
  const navigate = useNavigate();
  const location = useLocation();
  const subscription = useAccountStore((s) => s.subscription);
  const [cancelled, setCancelled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const expirationDate = subscription?.expiresAt ? fromUnixTime(subscription.expiresAt) : null;

  const cancelSubscriptionConfirmHandler = async () => {
    setSubmitting(true);
    setError(null);

    try {
      await accountController.updateSubscription('cancelled');

      if (expirationDate) {
        const formattedDate = format(expirationDate, 'P', { locale: { code: i18n.language } });
        announce(t('subscription_cancelled.message', { date: formattedDate }), 'success');
      }

      setCancelled(true);
    } catch (error: unknown) {
      setError(t('cancel_subscription.unknown_error_occurred'));
    }

    setSubmitting(false);
  };

  const closeHandler = () => {
    navigate(modalURLFromLocation(location, null), { replace: true });
  };

  if (!subscription) return null;

  return (
    <React.Fragment>
      {cancelled ? (
        <SubscriptionCancelled expiresDate={expirationDate ? format(expirationDate, 'P', { locale: { code: i18n.language } }) : ''} onClose={closeHandler} />
      ) : (
        <CancelSubscriptionForm onConfirm={cancelSubscriptionConfirmHandler} onCancel={closeHandler} submitting={submitting} error={error} />
      )}
      {submitting ? <LoadingOverlay transparentBackground inline /> : null}
    </React.Fragment>
  );
};
export default CancelSubscription;
