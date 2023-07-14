import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Payment from 'payment';
import { object, string } from 'yup';

import Button from '../Button/Button';
import CreditCardCVCField from '../CreditCardCVCField/CreditCardCVCField';
import CreditCardExpiryField from '../CreditCardExpiryField/CreditCardExpiryField';
import CreditCardNumberField from '../CreditCardNumberField/CreditCardNumberField';
import TextField from '../TextField/TextField';

import styles from './PaymentForm.module.scss';

import useForm from '#src/hooks/useForm';
import { directPostCardPayment } from '#src/stores/CheckoutController';
import useCheckAccess from '#src/hooks/useCheckAccess';

type Props = {
  couponCode?: string;
  setUpdatingOrder: (value: boolean) => void;
};

const PaymentForm: React.FC<Props> = ({ couponCode, setUpdatingOrder }) => {
  const { t } = useTranslation('account');
  const { intervalCheckAccess } = useCheckAccess();

  const paymentData = useForm(
    { cardholderName: '', cardNumber: '', cardExpiry: '', cardCVC: '', cardExpMonth: '', cardExpYear: '' },
    async () => {
      setUpdatingOrder(true);
      await directPostCardPayment({ couponCode, ...paymentData.values });
      intervalCheckAccess({ interval: 15000 });
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
