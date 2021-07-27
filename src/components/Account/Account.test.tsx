import React from 'react';
import { render } from '@testing-library/react';
import type { Customer } from 'types/account';

import customer from '../../fixtures/customer.json';

import Account from './Account';

describe('<Account>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(
      <Account
        customer={customer as Customer}
        isLoading={false}
        consentsLoading={false}
        onUpdateEmailSubmit={() => null}
        onUpdateInfoSubmit={() => null}
        onUpdateConsentsSubmit={() => null}
        onDeleteAccountClick={() => null}
      />,
    );

    // todo
    expect(container).toMatchSnapshot();
  });
});
