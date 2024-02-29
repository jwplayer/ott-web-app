import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import AccountController from '@jwp/ott-common/src/controllers/AccountController';
import { modalURLFromLocation } from '@jwp/ott-ui-react/src/utils/location';
import { formatLocalizedDate } from '@jwp/ott-common/src/utils/formatting';

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
  const expirationDateFormatted = subscription?.expiresAt ? formatLocalizedDate(new Date(subscription.expiresAt * 1000), i18n.language) : '';

  const cancelSubscriptionConfirmHandler = async () => {
    setSubmitting(true);
    setError(null);

    try {
      await accountController.updateSubscription('cancelled');

      if (expirationDateFormatted) {
        announce(t('subscription_cancelled.message', { date: expirationDateFormatted }), 'success');
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
        <SubscriptionCancelled expiresDate={expirationDateFormatted} onClose={closeHandler} />
      ) : (
        <CancelSubscriptionForm onConfirm={cancelSubscriptionConfirmHandler} onCancel={closeHandler} submitting={submitting} error={error} />
      )}
      {submitting ? <LoadingOverlay transparentBackground inline /> : null}
    </React.Fragment>
  );
};
export default CancelSubscription;
