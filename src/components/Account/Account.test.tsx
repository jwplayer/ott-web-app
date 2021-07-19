import React from 'react';
import { render } from '@testing-library/react';

import Account from './Account';

describe('<Account>', () => {
  test('renders and matches snapshot', () => {
    const account = { email: 'test@test.com' } as Account;
    const { container } = render(<Account account={account} update={(account) => console.info(account)} />);

    // todo
    expect(container).toMatchSnapshot();
  });
});
