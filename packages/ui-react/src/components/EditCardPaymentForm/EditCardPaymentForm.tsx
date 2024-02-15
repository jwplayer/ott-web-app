import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Payment from 'payment';
import { object, string } from 'yup';
import { useMutation } from 'react-query';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import AccountController from '@jwp/ott-common/src/controllers/AccountController';
import useForm from '@jwp/ott-hooks-react/src/useForm';

import Button from '../Button/Button';
import CreditCardCVCField from '../CreditCardCVCField/CreditCardCVCField';
import CreditCardExpiryField from '../CreditCardExpiryField/CreditCardExpiryField';
import CreditCardNumberField from '../CreditCardNumberField/CreditCardNumberField';
import TextField from '../TextField/TextField';
import { useAriaAnnouncer } from '../../containers/AnnouncementProvider/AnnoucementProvider';

import styles from './EditCardPaymentForm.module.scss';

type EditCardPaymentFormData = {
  cardholderName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCVC: string;
  cardExpMonth: string;
  cardExpYear: string;
};

type Props = {
  onCancel: () => void;
  setUpdatingCardDetails: (e: boolean) => void;
};

const EditCardPaymentForm: React.FC<Props> = ({ onCancel, setUpdatingCardDetails }) => {
  const accountController = getModule(AccountController);
  const announce = useAriaAnnouncer();

  const { t } = useTranslation('account');
  const { mutate: mutateCardDetails, isLoading } = useMutation(accountController.updateCardDetails);
  const { activePayment } = useAccountStore(({ activePayment }) => ({ activePayment }), shallow);

  const paymentData = useForm<EditCardPaymentFormData>({
    initialValues: { cardholderName: '', cardNumber: '', cardExpiry: '', cardCVC: '', cardExpMonth: '', cardExpYear: '' },
    validationSchema: object().shape({
      cardholderName: string().required(),
      cardNumber: string()
        .required()
        .test('card number validation', t('checkout.invalid_card_number'), (value) => {
          return Payment.fns.validateCardNumber(value as string);
        }),
      cardExpiry: string()
        .required()
        .test('card expiry validation', t('checkout.invalid_card_expiry'), (value) => {
          return Payment.fns.validateCardExpiry(value as string);
        }),
      cardCVC: string()
        .required()
        .test('cvc validation', t('checkout.invalid_cvc_number'), (value) => {
          const issuer = Payment.fns.cardType(paymentData?.values?.cardNumber);

          return Payment.fns.validateCardCVC(value as string, issuer);
        }),
      cardExpMonth: string().required(),
      cardExpYear: string().required(),
    }),
    validateOnBlur: true,
    onSubmit: async () => {
      setUpdatingCardDetails(true);
      mutateCardDetails(
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
          onSuccess: () => {
            announce(t('checkout.card_details_updated'), 'success');
          },
        },
      );
    },
  });

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
          autoComplete="cc-name"
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
          disabled={isLoading}
          label={t('checkout.save')}
          variant="contained"
          onClick={paymentData.handleSubmit as () => void}
          type="submit"
          color="primary"
          size="large"
          fullWidth
        />
      </div>
    </div>
  );
};

export default EditCardPaymentForm;
