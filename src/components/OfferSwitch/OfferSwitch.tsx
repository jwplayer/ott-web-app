import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import styles from './OfferSwitch.module.scss';

import type { Offer } from '#types/checkout';
import Checkbox from '#components/Checkbox/Checkbox';
import { formatLocalizedDate, formatPrice } from '#src/utils/formatting';
import { useAccountStore } from '#src/stores/AccountStore';

interface OfferSwitchProps {
  isCurrentOffer: boolean;
  pendingDowngradeOfferId: string;
  offer: Offer;
  selected: {
    value: boolean;
    set: React.Dispatch<React.SetStateAction<string | null>>;
  };
}

const OfferSwitch = ({ isCurrentOffer, pendingDowngradeOfferId, offer, selected }: OfferSwitchProps) => {
  const { t, i18n } = useTranslation('user');
  const { customerPriceInclTax, customerCurrency, period } = offer;
  const expiresAt = useAccountStore((state) => state.subscription?.expiresAt);

  const isPendingDowngrade = pendingDowngradeOfferId === offer.offerId;

  return (
    <div className={classNames(styles.offerSwitchContainer, { [styles.activeOfferSwitchContainer]: selected.value })}>
      <Checkbox disabled={isPendingDowngrade} name={offer.offerId} checked={selected.value} onChange={() => selected.set(offer.offerId)} />
      <div className={styles.offerSwitchInfoContainer}>
        {(isCurrentOffer || isPendingDowngrade) && (
          <div className={classNames(styles.currentPlanHeading, { [styles.activeCurrentPlanHeading]: selected.value })}>
            {isCurrentOffer && t('payment.current_plan').toUpperCase()}
            {isPendingDowngrade && t('payment.pending_downgrade').toUpperCase()}
          </div>
        )}
        <div className={styles.offerSwitchPlanContainer}>
          <div>{t(`payment.${period === 'month' ? 'monthly' : 'annual'}_subscription`)}</div>
          {(isCurrentOffer || isPendingDowngrade) && expiresAt && (
            <div className={styles.nextBillingDate}>
              {isCurrentOffer &&
                !pendingDowngradeOfferId &&
                t('payment.next_billing_date_on', { date: formatLocalizedDate(new Date(expiresAt * 1000), i18n.language) })}
              {isPendingDowngrade && t('payment.downgrade_on', { date: formatLocalizedDate(new Date(expiresAt * 1000), i18n.language) })}
            </div>
          )}
        </div>
      </div>
      <div className={styles.price}>
        {formatPrice(customerPriceInclTax, customerCurrency, undefined)}
        {
          //todo: i18n
        }
        <span className={styles.paymentFrequency}>/{period === 'month' ? 'month' : 'year'}</span>
      </div>
    </div>
  );
};

export default OfferSwitch;
