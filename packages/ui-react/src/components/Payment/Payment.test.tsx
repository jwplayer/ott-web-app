import React from 'react';
import type { Customer } from '@jwp/ott-common/types/account';
import type { PaymentDetail, Subscription, Transaction } from '@jwp/ott-common/types/subscription';
import customer from '@jwp/ott-testing/fixtures/customer.json';
import transactions from '@jwp/ott-testing/fixtures/transactions.json';
import paymentDetail from '@jwp/ott-testing/fixtures/paymentDetail.json';
import subscription from '@jwp/ott-testing/fixtures/subscription.json';

import { renderWithRouter } from '../../../test/utils';

import Payment from './Payment';

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
        isExternalPaymentProvider={false}
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
