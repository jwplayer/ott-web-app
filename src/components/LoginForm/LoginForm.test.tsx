import React from 'react';

import { render } from '../../testUtils';

import LoginForm from './LoginForm';

describe('<LoginForm>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<LoginForm />);

    expect(container).toMatchSnapshot();
  });
});
