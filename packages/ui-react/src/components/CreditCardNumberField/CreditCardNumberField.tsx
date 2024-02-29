import React, { useState } from 'react';
import Payment from 'payment';

import TextField from '../TextField/TextField';

import styles from './CreditCardNumberField.module.scss';

type Props = {
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  error?: string;
  value?: string;
};

const cardIssuers: { [key: string]: string } = {
  visa: '/images/payments/visa.svg',
  mastercard: '/images/payments/mastercard.svg',
  maestro: '/images/payments/maestro.svg',
  amex: '/images/payments/amex.svg',
  discover: '/images/payments/discover.svg',
  diners: '/images/payments/diners.svg',
  dinersclub: '/images/payments/diners.svg',
  unionpay: '/images/payments/unionpay.svg',
  hiper: '/images/payments/hiper.svg',
};

const CreditCardNumberField: React.FC<Props> = ({ value, error, onChange, onBlur, ...props }: Props) => {
  const [cardIssuer, setCardIssuer] = useState<JSX.Element | null>(null);

  const formatCreditCardNumber: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const issuer = Payment.fns.cardType(e.target?.value);
    const clearValue = e.target?.value.replace(/\D+/g, '');

    let nextValue;
    setCardIssuer(
      cardIssuers?.[issuer] ? (
        <div className={styles.cardTypeWrapper}>
          <img src={cardIssuers[issuer]} alt={issuer} height="25" />
        </div>
      ) : null,
    );

    switch (issuer) {
      case 'amex':
        nextValue = `${clearValue.slice(0, 4)} ${clearValue.slice(4, 10)} ${clearValue.slice(10, 15)}`;
        break;
      case 'dinersclub':
        nextValue = `${clearValue.slice(0, 4)} ${clearValue.slice(4, 10)} ${clearValue.slice(10, 14)}`;
        break;
      default:
        nextValue = `${clearValue.slice(0, 4)} ${clearValue.slice(4, 8)} ${clearValue.slice(8, 12)} ${clearValue.slice(12, 16)}`;
        break;
    }

    if (onChange) {
      e.target.value = nextValue.trim();
      onChange(e);
    }
  };

  return (
    <TextField
      value={value}
      name="cardNumber"
      label={`Card number`}
      className="directPostCreditCardNumber"
      onChange={formatCreditCardNumber}
      onBlur={onBlur}
      error={!!error}
      helperText={error ? error : null}
      pattern="\d*"
      {...props}
      type="text"
      placeholder="1234 5678 9012 3456"
      rightControl={cardIssuer}
      required
    />
  );
};

export default CreditCardNumberField;
