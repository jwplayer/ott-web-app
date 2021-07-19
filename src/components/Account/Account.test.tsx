import React from 'react';
import { render } from '@testing-library/react';
import type { Customer } from 'types/account';

import Account from './Account';

describe('<Account>', () => {
  test('renders and matches snapshot', () => {
    const customer: Customer = {
      id: '1',
      email: 'todo@test.nl',
      locale: 'en_en',
      country: 'England',
      currency: 'Euro',
      lastUserIp: 'temp',
    };
    const { container } = render(<Account customer={customer} update={(customer) => console.info(customer)} />);

    // todo
    expect(container).toMatchSnapshot();
  });
});
