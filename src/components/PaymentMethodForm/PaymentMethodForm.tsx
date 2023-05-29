import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './PaymentMethodForm.module.scss';

import CreditCard from '#src/icons/CreditCard';
import PayPal from '#src/icons/PayPal';
import Button from '#components/Button/Button';
import LoadingOverlay from '#components/LoadingOverlay/LoadingOverlay';
import type { PaymentMethod } from '#types/checkout';

type Props = {
  paymentMethodId?: number;
  onCloseButtonClick: () => void;
  paymentMethods?: PaymentMethod[];
  onPaymentMethodChange: React.ChangeEventHandler<HTMLInputElement>;
  renderPaymentMethod?: () => JSX.Element | null;
  submitting: boolean;
  updateSuccess: boolean;
};

const PaymentMethodForm: React.FC<Props> = ({
  paymentMethodId,
  paymentMethods,
  onCloseButtonClick,
  onPaymentMethodChange,
  renderPaymentMethod,
  submitting,
  updateSuccess,
}) => {
  const { t } = useTranslation('account');

  const cardPaymentMethod = paymentMethods?.find((method) => method.methodName === 'card');
  const paypalPaymentMethod = paymentMethods?.find((method) => method.methodName === 'paypal');

  return (
    <>
      <h1 className={styles.title}>{t('payment.update_payment_details')}</h1>
      {updateSuccess ? (
        <>
          <p className={styles.success}>{t('payment.update_payment_success')}</p>
          <Button label={t('payment.back_to_profile')} onClick={onCloseButtonClick} color="primary" fullWidth />
        </>
      ) : (
        <>
          <div className={styles.paymentMethodsInputs}>
            {cardPaymentMethod ? (
              <div className={styles.paymentMethod}>
                <input
                  className={styles.radio}
                  type="radio"
                  name="paymentMethod"
                  value={cardPaymentMethod.id}
                  id="card"
                  checked={paymentMethodId === cardPaymentMethod.id}
                  onChange={onPaymentMethodChange}
                />
                <label className={styles.paymentMethodLabel} htmlFor="card">
                  <CreditCard />
                  {t('payment.credit_card')}
                </label>
              </div>
            ) : null}
            {paypalPaymentMethod ? (
              <div className={styles.paymentMethod}>
                <input
                  className={styles.radio}
                  type="radio"
                  name="paymentMethod"
                  value={paypalPaymentMethod.id}
                  id="paypal"
                  checked={paymentMethodId === paypalPaymentMethod.id}
                  onChange={onPaymentMethodChange}
                />
                <label className={styles.paymentMethodLabel} htmlFor="paypal">
                  <PayPal /> {t('payment.paypal')}
                </label>
              </div>
            ) : null}
          </div>
          <div>{renderPaymentMethod ? renderPaymentMethod() : null}</div>
          {submitting && <LoadingOverlay transparentBackground inline />}
        </>
      )}
    </>
  );
};

export default PaymentMethodForm;
