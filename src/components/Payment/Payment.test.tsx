import React from 'react';
import { render } from '@testing-library/react';

import Payment from './Payment';

import customer from '#test/fixtures/customer.json';
import transactions from '#test/fixtures/transactions.json';
import paymentDetail from '#test/fixtures/paymentDetail.json';
import subscription from '#test/fixtures/subscription.json';
import type { Customer } from '#types/account';
import type { PaymentDetail, Subscription, Transaction } from '#types/subscription';

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
