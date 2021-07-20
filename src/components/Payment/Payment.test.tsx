import React from 'react';
import { render } from '@testing-library/react';
import type { Subscription } from 'types/subscription';

import Payment from './Payment';

describe('<Payment>', () => {
  test('renders and matches snapshot', () => {
    const subscription = {} as Subscription;

    const { container } = render(<Payment subscription={subscription} update={(subscription) => console.info(subscription)} />);

    // todo
    expect(container).toMatchSnapshot();
  });
});
