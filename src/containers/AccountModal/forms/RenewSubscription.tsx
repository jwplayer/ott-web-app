import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import shallow from 'zustand/shallow';

import { useAccountStore } from '#src/stores/AccountStore';
import LoadingOverlay from '#components/LoadingOverlay/LoadingOverlay';
import RenewSubscriptionForm from '#components/RenewSubscriptionForm/RenewSubscriptionForm';
import SubscriptionRenewed from '#components/SubscriptionRenewed/SubscriptionRenewed';
import { removeQueryParam } from '#src/utils/location';
import { updateSubscription } from '#src/stores/AccountController';

const RenewSubscription = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('account');
  const { subscription, user } = useAccountStore(({ subscription, user }) => ({ subscription, user }), shallow);
  const [renewed, setRenewed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const renewSubscriptionConfirmHandler = async () => {
    setSubmitting(true);
    setError(null);

    try {
      await updateSubscription('active');
      setRenewed(true);
    } catch (error: unknown) {
      setError(t('renew_subscription.unknown_error_occurred'));
    }

    setSubmitting(false);
  };

  const closeHandler = () => {
    navigate(removeQueryParam(location, 'u'), { replace: true });
  };

  if (!subscription || !user) return null;

  return (
    <React.Fragment>
      {renewed ? (
        <SubscriptionRenewed onClose={closeHandler} subscription={subscription} customer={user} />
      ) : (
        <RenewSubscriptionForm
          subscription={subscription}
          customer={user}
          error={error}
          onConfirm={renewSubscriptionConfirmHandler}
          onClose={closeHandler}
          submitting={submitting}
        />
      )}
      {submitting ? <LoadingOverlay inline /> : null}
    </React.Fragment>
  );
};
export default RenewSubscription;
