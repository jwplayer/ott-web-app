import React from 'react';
import { render } from '@testing-library/react';

import ForgotPasswordForm from './ForgotPasswordForm';

describe('<ForgotPasswordForm>', () => {
  test('renders and matches snapshot type forgot', () => {
    const { container } = render(
      <ForgotPasswordForm submitting={false} onSubmit={vi.fn()} onChange={vi.fn()} value={{ email: '' }} errors={{}} onBlur={vi.fn()} />,
    );

    expect(container).toMatchSnapshot();
  });
});
