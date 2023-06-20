import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Payment from 'payment';
import { object, string } from 'yup';
import { useMutation } from 'react-query';
import shallow from 'zustand/shallow';

import Button from '../Button/Button';
import CreditCardCVCField from '../CreditCardCVCField/CreditCardCVCField';
import CreditCardExpiryField from '../CreditCardExpiryField/CreditCardExpiryField';
import CreditCardNumberField from '../CreditCardNumberField/CreditCardNumberField';
import TextField from '../TextField/TextField';

import styles from './EditCardPaymentForm.module.scss';

import useForm from '#src/hooks/useForm';
import { updateCardDetails } from '#src/stores/AccountController';
import { useAccountStore } from '#src/stores/AccountStore';

type Props = {
  onCancel: () => void;
  setUpdatingCardDetails: (e: boolean) => void;
};

const EditCardPaymentForm: React.FC<Props> = ({ onCancel, setUpdatingCardDetails }) => {
  const { t } = useTranslation('account');
  const updateCard = useMutation(updateCardDetails);
  const { activePayment } = useAccountStore(({ activePayment }) => ({ activePayment }), shallow);
  const paymentData = useForm(
    { cardholderName: '', cardNumber: '', cardExpiry: '', cardCVC: '', cardExpMonth: '', cardExpYear: '' },
    async () => {
      setUpdatingCardDetails(true);
      updateCard.mutate(
        {
          cardName: paymentData.values.cardholderName,
          cardNumber: paymentData.values.cardNumber.replace(/\s+/g, ''),
          cvc: parseInt(paymentData.values.cardCVC),
          expMonth: parseInt(paymentData.values.cardExpMonth),
          expYear: parseInt(paymentData.values.cardExpYear),
          currency: activePayment?.currency || '',
        },
        {
          onSettled: () => onCancel(),
        },
      );
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
        <Button
          disabled={updateCard.isLoading}
          label={t('checkout.save')}
          variant="contained"
          onClick={paymentData.handleSubmit as () => void}
          color="primary"
          size="large"
          fullWidth
        />
      </div>
    </div>
  );
};

export default EditCardPaymentForm;
