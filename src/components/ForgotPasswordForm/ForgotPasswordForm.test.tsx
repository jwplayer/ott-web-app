import React from 'react';

import { render } from '../../testUtils';

import ForgotPasswordForm from './ForgotPasswordForm';

describe('<ForgotPasswordForm>', () => {
  test('renders and matches snapshot type forgot', () => {
    const { container } = render(
      <ForgotPasswordForm type="forgot" submitting={false} onSubmit={jest.fn()} onChange={jest.fn()} value={{ email: '' }} errors={{}} />,
    );

    expect(container).toMatchSnapshot();
  });

  test('renders and matches snapshot type confirmation', () => {
    const { container } = render(
      <ForgotPasswordForm type="confirmation" submitting={false} onSubmit={jest.fn()} onChange={jest.fn()} value={{ email: '' }} errors={{}} />,
    );

    expect(container).toMatchSnapshot();
  });
});
