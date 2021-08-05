import React from 'react';

import { render } from '../../testUtils';

import ForgotPasswordForm from './ForgotPasswordForm';

describe('<ForgotPasswordForm>', () => {
  test('renders and matches snapshot type forgot', () => {
    const { container } = render(
      <ForgotPasswordForm submitting={false} onSubmit={jest.fn()} onChange={jest.fn()} value={{ email: '' }} errors={{}}  onBlur={jest.fn()}/>,
    );

    expect(container).toMatchSnapshot();
  });
});
