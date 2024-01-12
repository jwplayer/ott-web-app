import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import Payment from 'payment';
import { object, string } from 'yup';
import { getModule } from '@jwp/ott-common/src/modules/container';
import CheckoutController from '@jwp/ott-common/src/stores/CheckoutController';
import useForm from '@jwp/ott-hooks-react/src/useForm';
import useCheckAccess from '@jwp/ott-hooks-react/src/useCheckAccess';
import { addQueryParam } from '@jwp/ott-common/src/utils/location';
import { addQueryParams } from '@jwp/ott-common/src/utils/formatting';

import Button from '../Button/Button';
import CreditCardCVCField from '../CreditCardCVCField/CreditCardCVCField';
import CreditCardExpiryField from '../CreditCardExpiryField/CreditCardExpiryField';
import CreditCardNumberField from '../CreditCardNumberField/CreditCardNumberField';
import TextField from '../TextField/TextField';

import styles from './PaymentForm.module.scss';

type Props = {
  couponCode?: string;
  setUpdatingOrder: (value: boolean) => void;
};

const PaymentForm: React.FC<Props> = ({ couponCode, setUpdatingOrder }) => {
  const checkoutController = getModule(CheckoutController);

  const { t } = useTranslation('account');
  const location = useLocation();
  const navigate = useNavigate();
  const { intervalCheckAccess } = useCheckAccess();

  const paymentData = useForm(
    { cardholderName: '', cardNumber: '', cardExpiry: '', cardCVC: '', cardExpMonth: '', cardExpYear: '' },
    async () => {
      setUpdatingOrder(true);

      const referrer = window.location.href;
      const returnUrl = addQueryParams(window.location.href, { u: 'waiting-for-payment' });

      await checkoutController.directPostCardPayment({ couponCode, ...paymentData.values }, referrer, returnUrl);

      intervalCheckAccess({
        interval: 15000,
        callback: (hasAccess) => hasAccess && navigate(addQueryParam(location, 'u', 'welcome')),
      });
    },
    object().shape({
      cardNumber: string().test('card number validation', t('checkout.invalid_card_number'), (value) => {
        return Payment.fns.validateCardNumber(value as string);
      }),
      cardExpiry: string().test('card expiry validation', t('checkout.invalid_card_expiry'), (value) => {
        return Payment.fns.validateCardExpiry(value as string);
      }),
      cardCVC: string().test('cvc validation', t('checkout.invalid_cvc_number'), (value) => {
        const issuer = Payment.fns.cardType(paymentData?.values?.cardNumber);
        return Payment.fns.validateCardCVC(value as string, issuer);
      }),
    }),
    true,
  );

  useEffect(() => {
    if (paymentData.values.cardExpiry) {
      const expiry = Payment.fns.cardExpiryVal(paymentData.values.cardExpiry);
      if (expiry.month) {
        paymentData.setValue('cardExpMonth', expiry.month.toString());
      }
      if (expiry.year) {
        paymentData.setValue('cardExpYear', expiry.year.toString());
      }
    }
    //eslint-disable-next-line
  }, [paymentData.values.cardExpiry]);

  return (
    <div className={styles.paymentForm}>
      <div>
        <TextField
          label={t('checkout.card_holder_name')}
          name="cardholderName"
          value={paymentData?.values?.cardholderName}
          onChange={paymentData?.handleChange}
          onBlur={paymentData?.handleBlur}
          placeholder={t('checkout.credit_card_name')}
          required
        />
      </div>
      <div>
        <CreditCardNumberField
          value={paymentData?.values?.cardNumber?.toString()}
          error={paymentData?.errors?.cardNumber}
          onBlur={paymentData?.handleBlur}
          onChange={paymentData?.handleChange}
        />
      </div>
      <div className={styles.columns}>
        <div>
          <CreditCardExpiryField
            value={paymentData?.values?.cardExpiry}
            onBlur={paymentData?.handleBlur}
            onChange={paymentData?.handleChange}
            error={paymentData?.errors?.cardExpiry}
          />
        </div>
        <div>
          <CreditCardCVCField
            value={paymentData?.values?.cardCVC}
            onBlur={paymentData?.handleBlur}
            onChange={paymentData?.handleChange}
            error={paymentData?.errors?.cardCVC}
          />
        </div>
      </div>
      <div>
        <Button label={t('checkout.continue')} variant="contained" color="primary" onClick={paymentData.handleSubmit as () => void} size="large" fullWidth />
      </div>
    </div>
  );
};

export default PaymentForm;
