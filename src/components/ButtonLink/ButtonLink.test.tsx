import React from 'react';

import { render } from '../../testUtils';

import ButtonLink from './ButtonLink';

describe('<ButtonLink />', () => {
  test('renders link with route label', () => {
    const { getByText } = render(<ButtonLink label="home" to="/" />);
    expect(getByText(/home/i)).toBeTruthy();
  });

  it('renders and matches snapshot', () => {
    const { container } = render(<ButtonLink label="home" to="/" />);

    expect(container).toMatchSnapshot();
  });
});
