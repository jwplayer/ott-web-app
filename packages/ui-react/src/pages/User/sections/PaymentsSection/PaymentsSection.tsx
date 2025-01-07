import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import AccountController from '@jwp/ott-common/src/controllers/AccountController';
import useOffers from '@jwp/ott-hooks-react/src/useOffers';
import { useSubscriptionChange } from '@jwp/ott-hooks-react/src/useSubscriptionChange';
import { ACCESS_MODEL } from '@jwp/ott-common/src/constants';
import { RELATIVE_PATH_USER_ACCOUNT } from '@jwp/ott-common/src/paths';

import styles from '../../User.module.scss';
import LoadingOverlay from '../../../../components/LoadingOverlay/LoadingOverlay';
import Payment from '../../../../components/Payment/Payment';
import { modalURLFromLocation } from '../../../../utils/location';

/**
 * Handles billing receipts by either downloading the receipt directly if it is an instance of Blob,
 * or opening it in a new window if it is a string representation.
 *
 * @param {Blob | string} receipt - The billing receipt data. If a Blob, it will be downloaded; if a string,
 * it will be treated as an HTML representation and opened in a new window.
 * @param {string} transactionId - The unique identifier for the transaction associated with the receipt.
 *
 * @returns {void}
 *
 */
const processBillingReceipt = (receipt: Blob | string, transactionId: string) => {
  if (receipt instanceof Blob) {
    const url = window.URL.createObjectURL(new Blob([receipt]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `receipt_${transactionId}.pdf`);
    document.body.appendChild(link);
    link.click();
  } else {
    const newWindow = window.open('', `Receipt ${transactionId}`, '');
    const htmlString = window.atob(receipt as unknown as string);

    if (newWindow) {
      newWindow.opener = null;
      newWindow.document.write(htmlString);
      newWindow.document.close();
    }
  }
};

const EXTERNAL_PAYMENT_METHODS = ['Apple In-App', 'Google In-App', 'Roku In-App'];
const STORE_LINKS: Record<string, string> = {
  apple: 'https://support.apple.com/118428',
  google: 'https://support.google.com/googleplay/answer/7018481',
  roku: 'https://support.roku.com/article/208756478',
};

const PaymentsSection = () => {
  const accountController = getModule(AccountController);

  const navigate = useNavigate();

  const { accessModel } = useConfigStore(({ accessModel }) => ({ accessModel }), shallow);
  const { user: customer, subscription: activeSubscription, transactions, activePayment, pendingOffer, loading } = useAccountStore();
  const { canUpdatePaymentMethod, canShowReceipts, canRenewSubscription } = accountController.getFeatures();
  const { subscriptionOffers, switchSubscriptionOffers } = useOffers();

  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [isLoadingReceipt, setIsLoadingReceipt] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(activeSubscription?.accessFeeId ?? null);
  const [isUpgradeOffer, setIsUpgradeOffer] = useState<boolean | undefined>(undefined);

  const location = useLocation();

  useEffect(() => {
    if (accessModel === ACCESS_MODEL.AVOD) navigate(RELATIVE_PATH_USER_ACCOUNT);
  }, [accessModel, navigate]);

  const handleUpgradeSubscriptionClick = async () => navigate(modalURLFromLocation(location, 'upgrade-subscription'));

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
  const isExternalPaymentProvider = !!activeSubscription && EXTERNAL_PAYMENT_METHODS.includes(activeSubscription.paymentMethod);
  const paymentProvider = activeSubscription?.paymentMethod.split(' ')[0] || 'unknown';
  const paymentProviderLink = STORE_LINKS[paymentProvider.toLowerCase()];

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
      offerSwitchesAvailable={switchSubscriptionOffers.length > 0}
      canShowReceipts={canShowReceipts}
      onShowReceiptClick={handleShowReceiptClick}
      offers={subscriptionOffers}
      pendingDowngradeOfferId={pendingDowngradeOfferId}
      changeSubscriptionPlan={changeSubscriptionPlan}
      onChangePlanClick={onChangePlanClick}
      selectedOfferId={selectedOfferId}
      setSelectedOfferId={(offerId: string | null) => setSelectedOfferId(offerId)}
      isUpgradeOffer={isUpgradeOffer}
      setIsUpgradeOffer={(isUpgradeOffer: boolean | undefined) => setIsUpgradeOffer(isUpgradeOffer)}
      isExternalPaymentProvider={isExternalPaymentProvider}
      paymentProvider={paymentProvider}
      paymentProviderLink={paymentProviderLink}
    />
  );
};

export default PaymentsSection;
