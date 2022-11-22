import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import { useAccountStore } from '#src/stores/AccountStore';
import CancelSubscriptionForm from '#components/CancelSubscriptionForm/CancelSubscriptionForm';
import LoadingOverlay from '#components/LoadingOverlay/LoadingOverlay';
import SubscriptionCancelled from '#components/SubscriptionCancelled/SubscriptionCancelled';
import { formatDate } from '#src/utils/formatting';
import { removeQueryParam } from '#src/utils/location';
import { updateSubscription } from '#src/stores/AccountController';

const CancelSubscription = () => {
  const { t } = useTranslation('account');
  const navigate = useNavigate();
  const location = useLocation();
  const subscription = useAccountStore((s) => s.subscription);
  const [cancelled, setCancelled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelSubscriptionConfirmHandler = async () => {
    setSubmitting(true);
    setError(null);

    try {
      await updateSubscription('cancelled');
      setCancelled(true);
    } catch (error: unknown) {
      setError(t('cancel_subscription.unknown_error_occurred'));
    }

    setSubmitting(false);
  };

  const closeHandler = () => {
    navigate(removeQueryParam(location, 'u'), { replace: true });
  };

  if (!subscription) return null;

  return (
    <React.Fragment>
      {cancelled ? (
        <SubscriptionCancelled expiresDate={formatDate(subscription.expiresAt)} onClose={closeHandler} />
      ) : (
        <CancelSubscriptionForm onConfirm={cancelSubscriptionConfirmHandler} onCancel={closeHandler} submitting={submitting} error={error} />
      )}
      {submitting ? <LoadingOverlay transparentBackground inline /> : null}
    </React.Fragment>
  );
};
export default CancelSubscription;
