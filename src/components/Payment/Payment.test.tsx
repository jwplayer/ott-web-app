import React from 'react';

import Payment from './Payment';

import customer from '#test/fixtures/customer.json';
import transactions from '#test/fixtures/transactions.json';
import paymentDetail from '#test/fixtures/paymentDetail.json';
import subscription from '#test/fixtures/subscription.json';
import type { Customer } from '#types/account';
import type { PaymentDetail, Subscription, Transaction } from '#types/subscription';
import { renderWithRouter } from '#test/testUtils';
import * as checkoutController from '#src/stores/CheckoutController';

describe('<Payment>', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders and matches snapshot', () => {
    const spy = vi.spyOn(checkoutController, 'getSubscriptionSwitches');
    spy.mockResolvedValue(undefined);

    const { container } = renderWithRouter(
      <Payment
        accessModel="AVOD"
        customer={customer as Customer}
        transactions={transactions as Transaction[]}
        activeSubscription={subscription as Subscription}
        activePaymentDetail={paymentDetail as PaymentDetail}
        canUpdatePaymentMethod={false}
        showAllTransactions={false}
        isLoading={false}
        offerSwitchesAvailable={false}
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
