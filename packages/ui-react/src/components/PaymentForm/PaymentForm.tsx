import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Payment from 'payment';
import { object, string } from 'yup';
import useForm from '@jwp/ott-hooks-react/src/useForm';
import { testId } from '@jwp/ott-common/src/utils/common';

import Button from '../Button/Button';
import CreditCardCVCField from '../CreditCardCVCField/CreditCardCVCField';
import CreditCardExpiryField from '../CreditCardExpiryField/CreditCardExpiryField';
import CreditCardNumberField from '../CreditCardNumberField/CreditCardNumberField';
import TextField from '../TextField/TextField';
import FormFeedback from '../FormFeedback/FormFeedback';

import styles from './PaymentForm.module.scss';

export type PaymentFormData = {
  cardholderName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCVC: string;
  cardExpMonth: string;
  cardExpYear: string;
};

type Props = {
  onPaymentFormSubmit: (values: PaymentFormData) => void;
};

const PaymentForm: React.FC<Props> = ({ onPaymentFormSubmit }) => {
  const { t } = useTranslation('account');

  const { values, errors, setValue, handleChange, handleBlur, handleSubmit } = useForm<PaymentFormData>({
    initialValues: { cardholderName: '', cardNumber: '', cardExpiry: '', cardCVC: '', cardExpMonth: '', cardExpYear: '' },
    validationSchema: object()
      .required()
      .shape({
        cardholderName: string().required(),
        cardNumber: string()
          .required()
          .test('card number validation', t('checkout.invalid_card_number'), (value) => Payment.fns.validateCardNumber(value as string)),
        cardExpiry: string()
          .required()
          .test('card expiry validation', t('checkout.invalid_card_expiry'), (value) => Payment.fns.validateCardExpiry(value as string)),
        cardCVC: string()
          .required()
          .test('cvc validation', t('checkout.invalid_cvc_number'), (value, context) => {
            const issuer = Payment.fns.cardType(context.parent.cardNumber);

            return Payment.fns.validateCardCVC(value as string, issuer);
          }),
        cardExpMonth: string().required(),
        cardExpYear: string().required(),
      }),
    validateOnBlur: true,
    onSubmit: onPaymentFormSubmit,
  });

  useEffect(() => {
    if (values.cardExpiry) {
      const expiry = Payment.fns.cardExpiryVal(values.cardExpiry);
      if (expiry.month) {
        setValue('cardExpMonth', expiry.month.toString());
      }
      if (expiry.year) {
        setValue('cardExpYear', expiry.year.toString());
      }
    }
    //eslint-disable-next-line
  }, [values.cardExpiry]);

  return (
    <div className={styles.paymentForm}>
      <form onSubmit={handleSubmit} data-testid={testId('payment_form')} noValidate>
        {errors.form ? (
          <div className={styles.formError}>
            <FormFeedback variant="error">{errors.form}</FormFeedback>
          </div>
        ) : null}
        <div>
          <TextField
            label={t('checkout.card_holder_name')}
            name="cardholderName"
            value={values.cardholderName}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={t('checkout.credit_card_name')}
            autoComplete="cc-name"
            required
          />
        </div>
        <div>
          <CreditCardNumberField value={values.cardNumber.toString()} error={errors.cardNumber} onBlur={handleBlur} onChange={handleChange} />
        </div>
        <div className={styles.columns}>
          <div>
            <CreditCardExpiryField value={values.cardExpiry} onBlur={handleBlur} onChange={handleChange} error={errors.cardExpiry} />
          </div>
          <div>
            <CreditCardCVCField value={values.cardCVC} onBlur={handleBlur} onChange={handleChange} error={errors.cardCVC} />
          </div>
        </div>
        <div>
          <Button label={t('checkout.continue')} variant="contained" color="primary" type="submit" size="large" fullWidth />
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
