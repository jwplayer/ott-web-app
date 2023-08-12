import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import styles from './OfferSwitch.module.scss';

import type { Offer } from '#types/checkout';
import Checkbox from '#components/Checkbox/Checkbox';
import { formatLocalizedDate, formatPrice } from '#src/utils/formatting';

type OfferSwitchProps = {
  isCurrentOffer: boolean;
  pendingDowngradeOfferId: string;
  offer: Offer;
  selected: boolean;
  onChange: (offerId: string) => void;
  expiresAt: number | undefined;
};

const OfferSwitch = ({ isCurrentOffer, pendingDowngradeOfferId, offer, selected, onChange, expiresAt }: OfferSwitchProps) => {
  const { t, i18n } = useTranslation(['user', 'account']);
  const { customerPriceInclTax, customerCurrency, period } = offer;

  const isPendingDowngrade = pendingDowngradeOfferId === offer.offerId;

  return (
    <div className={classNames(styles.offerSwitchContainer, { [styles.activeOfferSwitchContainer]: selected })}>
      <Checkbox disabled={isPendingDowngrade} name={offer.offerId} checked={selected} onChange={() => onChange(offer.offerId)} />
      <div className={styles.offerSwitchInfoContainer}>
        {(isCurrentOffer || isPendingDowngrade) && (
          <div className={classNames(styles.currentPlanHeading, { [styles.activeCurrentPlanHeading]: selected })}>
            {isCurrentOffer && t('user:payment.current_plan').toUpperCase()}
            {isPendingDowngrade && t('user:payment.pending_downgrade').toUpperCase()}
          </div>
        )}
        <div className={styles.offerSwitchPlanContainer}>
          <div>{t(`user:payment.${period === 'month' ? 'monthly' : 'annual'}_subscription`)}</div>
          {(isCurrentOffer || isPendingDowngrade) && expiresAt && (
            <div className={styles.nextBillingDate}>
              {isCurrentOffer &&
                !pendingDowngradeOfferId &&
                t('user:payment.next_billing_date_on', { date: formatLocalizedDate(new Date(expiresAt * 1000), i18n.language) })}
              {isPendingDowngrade && t('user:payment.downgrade_on', { date: formatLocalizedDate(new Date(expiresAt * 1000), i18n.language) })}
            </div>
          )}
        </div>
      </div>
      <div className={styles.price}>
        {formatPrice(customerPriceInclTax, customerCurrency, undefined)}
        <span className={styles.paymentFrequency}>/{t(`account:periods.${period}_one`)}</span>
      </div>
    </div>
  );
};

export default OfferSwitch;
