import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';

import CancelSubscriptionForm from '../../../components/CancelSubscriptionForm/CancelSubscriptionForm';
import { removeQueryParam } from '../../../utils/history';
import LoadingOverlay from '../../../components/LoadingOverlay/LoadingOverlay';
import { useAccountStore } from '../../../stores/AccountStore';
import SubscriptionCancelled from '../../../components/SubscriptionCancelled/SubscriptionCancelled';
import { formatDate } from '../../../utils/formatting';

import { updateSubscription } from '#src/stores/AccountController';

const CancelSubscription = () => {
  const { t } = useTranslation('account');
  const history = useHistory();
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
    history.replace(removeQueryParam(history, 'u'));
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
