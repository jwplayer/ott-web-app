import React from 'react';

import Payment from './Payment';

import customer from '#test/fixtures/customer.json';
import transactions from '#test/fixtures/transactions.json';
import paymentDetail from '#test/fixtures/paymentDetail.json';
import subscription from '#test/fixtures/subscription.json';
import type { Customer } from '#types/account';
import type { PaymentDetail, Subscription, Transaction } from '#types/subscription';
import { renderWithRouter } from '#test/testUtils';

describe('<Payment>', () => {
  test('renders and matches snapshot', () => {
    const { container } = renderWithRouter(
      <Payment
        accessModel="AVOD"
        customer={customer as Customer}
        transactions={transactions as Transaction[]}
        activeSubscription={subscription as Subscription}
        activePaymentDetail={paymentDetail as PaymentDetail}
        pendingOffer={null}
        canUpdatePaymentMethod={false}
        showAllTransactions={false}
        isLoading={false}
        offerSwitchesAvailable={false}
        onShowReceiptClick={vi.fn()}
        onUpgradeSubscriptionClick={vi.fn()}
        onShowAllTransactionsClick={vi.fn()}
        changeSubscriptionPlan={{
          isLoading: false,
          isSuccess: false,
          isError: false,
          reset: vi.fn(),
        }}
        onChangePlanClick={vi.fn()}
        selectedOfferId={null}
        setSelectedOfferId={vi.fn()}
        isUpgradeOffer={undefined}
        setIsUpgradeOffer={vi.fn()}
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
