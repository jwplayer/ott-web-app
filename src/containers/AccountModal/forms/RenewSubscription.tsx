import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import shallow from 'zustand/shallow';

import { removeQueryParam } from '../../../utils/history';
import LoadingOverlay from '../../../components/LoadingOverlay/LoadingOverlay';
import { useAccountStore } from '../../../stores/AccountStore';
import RenewSubscriptionForm from '../../../components/RenewSubscriptionForm/RenewSubscriptionForm';
import SubscriptionRenewed from '../../../components/SubscriptionRenewed/SubscriptionRenewed';

import { updateSubscription } from '#src/stores/AccountController';

const RenewSubscription = () => {
  const { t } = useTranslation('account');
  const history = useHistory();
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
    history.replace(removeQueryParam(history, 'u'));
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
