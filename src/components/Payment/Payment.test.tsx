import React from 'react';
import { render } from '@testing-library/react';

import customer from '../../fixtures/customer.json';
import transactions from '../../fixtures/transactions.json';
import paymentDetail from '../../fixtures/paymentDetail.json';
import subscription from '../../fixtures/subscription.json';
import type { Customer } from '../../../types/account';
import type { PaymentDetail, Subscription, Transaction } from '../../../types/subscription';

import Payment from './Payment';

describe.skip('<Payment>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(
      <Payment
        accessModel="AVOD"
        customer={customer as Customer}
        transactions={transactions as Transaction[]}
        activeSubscription={subscription as Subscription}
        activePaymentDetail={paymentDetail as PaymentDetail}
        showAllTransactions={false}
        isLoading={false}
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
