import { useTranslation } from 'react-i18next';

import Button from '../Button/Button';
import CreditCardCVCField from '../CreditCardCVCField/CreditCardCVCField';
import CreditCardExpiryField from '../CreditCardExpiryField/CreditCardExpiryField';
import CreditCardNumberField from '../CreditCardNumberField/CreditCardNumberField';
import TextField from '../TextField/TextField';

import styles from './PaymentForm.module.scss';

import type { GenericFormValues } from '#types/form';
import type { CardPaymentData } from '#types/checkout';

type Props = {
  paymentDataForm?: CardPaymentData & GenericFormValues;
};

const PaymentForm: React.FC<Props> = ({ paymentDataForm }) => {
  const { t } = useTranslation('account');

  return (
    <div className={styles.paymentForm}>
      <div>
        <TextField
          label="Cardholder name"
          name="cardholderName"
          value={paymentDataForm?.values?.cardholderName}
          onChange={paymentDataForm?.handleChange}
          onBlur={paymentDataForm?.handleBlur}
          placeholder={t('checkout.credit_card_name')}
          required
        />
      </div>
      <div>
        <CreditCardNumberField
          value={paymentDataForm?.values?.cardNumber?.toString()}
          error={paymentDataForm?.errors?.cardNumber}
          onBlur={paymentDataForm?.handleBlur}
          onChange={paymentDataForm?.handleChange}
        />
      </div>
      <div className={styles.columns}>
        <div>
          <CreditCardExpiryField
            value={paymentDataForm?.values?.cardExpiry}
            onBlur={paymentDataForm?.handleBlur}
            onChange={paymentDataForm?.handleChange}
            error={paymentDataForm?.errors?.cardExpiry}
          />
        </div>
        <div>
          <CreditCardCVCField
            value={paymentDataForm?.values?.cardCVC}
            onBlur={paymentDataForm?.handleBlur}
            onChange={paymentDataForm?.handleChange}
            error={paymentDataForm?.errors?.cardCVC}
          />
        </div>
      </div>
      <div>
        <Button label="continue" variant="contained" color="primary" onClick={paymentDataForm.handleSubmit} size="large" fullWidth />
      </div>
    </div>
  );
};

export default PaymentForm;
