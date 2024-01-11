import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import shallow from 'zustand/shallow';

import styles from '#src/pages/User/User.module.scss';
import LoadingOverlay from '#components/LoadingOverlay/LoadingOverlay';
import Payment from '#components/Payment/Payment';
import { useAccountStore } from '#src/stores/AccountStore';
import { useCheckoutStore } from '#src/stores/CheckoutStore';
import { useConfigStore } from '#src/stores/ConfigStore';
import { addQueryParam } from '#src/utils/location';
import useOffers from '#src/hooks/useOffers';
import { useSubscriptionChange } from '#src/hooks/useSubscriptionChange';
import AccountController from '#src/stores/AccountController';
import CheckoutController from '#src/stores/CheckoutController';
import { ACCESS_MODEL } from '#src/config';
import { getModule } from '#src/modules/container';
import { processBillingReceipt } from '#src/utils/common';

const PaymentContainer = () => {
  const accountController = getModule(AccountController);
  const checkoutController = getModule(CheckoutController);

  const { accessModel } = useConfigStore(
    (s) => ({
      accessModel: s.accessModel,
      favoritesList: s.config.features?.favoritesList,
    }),
    shallow,
  );
  const navigate = useNavigate();

  const { user: customer, subscription: activeSubscription, transactions, activePayment, pendingOffer, loading } = useAccountStore();
  const { canUpdatePaymentMethod, canShowReceipts, canRenewSubscription } = accountController.getFeatures();

  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [isLoadingReceipt, setIsLoadingReceipt] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(activeSubscription?.accessFeeId ?? null);
  const [isUpgradeOffer, setIsUpgradeOffer] = useState<boolean | undefined>(undefined);

  const { offerSwitches } = useCheckoutStore();
  const location = useLocation();

  const handleUpgradeSubscriptionClick = async () => {
    navigate(addQueryParam(location, 'u', 'upgrade-subscription'));
  };

  const handleShowReceiptClick = async (transactionId: string) => {
    setIsLoadingReceipt(true);

    try {
      const receipt = await accountController.getReceipt(transactionId);
      if (receipt) {
        processBillingReceipt(receipt, transactionId);
      }
    } catch (error: unknown) {
      throw new Error("Couldn't parse receipt. " + (error instanceof Error ? error.message : ''));
    }

    setIsLoadingReceipt(false);
  };

  useEffect(() => {
    if (accessModel !== ACCESS_MODEL.AVOD && canRenewSubscription) {
      checkoutController.getSubscriptionSwitches();
    }
  }, [accessModel, checkoutController, canRenewSubscription]);

  useEffect(() => {
    if (!loading && !customer) {
      navigate('/', { replace: true });
    }
  }, [navigate, customer, loading]);

  const { offers } = useOffers();

  const changeSubscriptionPlan = useSubscriptionChange(isUpgradeOffer ?? false, selectedOfferId, customer, activeSubscription?.subscriptionId);

  const onChangePlanClick = async () => {
    if (selectedOfferId && activeSubscription?.subscriptionId) {
      changeSubscriptionPlan.mutate({
        accessFeeId: selectedOfferId.slice(1),
        subscriptionId: `${activeSubscription.subscriptionId}`,
      });
    }
  };

  if (!customer) {
    return <LoadingOverlay />;
  }

  const pendingDowngradeOfferId = (customer.metadata?.[`${activeSubscription?.subscriptionId}_pending_downgrade`] as string) || '';

  return (
    <Payment
      accessModel={accessModel}
      activeSubscription={activeSubscription}
      activePaymentDetail={activePayment}
      transactions={transactions}
      customer={customer}
      pendingOffer={pendingOffer}
      isLoading={loading || isLoadingReceipt}
      panelClassName={styles.panel}
      panelHeaderClassName={styles.panelHeader}
      onShowAllTransactionsClick={() => setShowAllTransactions(true)}
      showAllTransactions={showAllTransactions}
      canUpdatePaymentMethod={canUpdatePaymentMethod}
      canRenewSubscription={canRenewSubscription}
      onUpgradeSubscriptionClick={handleUpgradeSubscriptionClick}
      offerSwitchesAvailable={!!offerSwitches.length}
      canShowReceipts={canShowReceipts}
      onShowReceiptClick={handleShowReceiptClick}
      offers={offers}
      pendingDowngradeOfferId={pendingDowngradeOfferId}
      changeSubscriptionPlan={changeSubscriptionPlan}
      onChangePlanClick={onChangePlanClick}
      selectedOfferId={selectedOfferId}
      setSelectedOfferId={(offerId: string | null) => setSelectedOfferId(offerId)}
      isUpgradeOffer={isUpgradeOffer}
      setIsUpgradeOffer={(isUpgradeOffer: boolean | undefined) => setIsUpgradeOffer(isUpgradeOffer)}
    />
  );
};

export default PaymentContainer;
