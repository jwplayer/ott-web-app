import React from 'react';
import { axe } from 'vitest-axe';
import { render } from '@testing-library/react';

import ForgotPasswordForm from './ForgotPasswordForm';

describe('<ForgotPasswordForm>', () => {
  test('renders and matches snapshot type forgot', () => {
    const { container } = render(
      <ForgotPasswordForm submitting={false} onSubmit={vi.fn()} onChange={vi.fn()} value={{ email: '' }} errors={{}} onBlur={vi.fn()} />,
    );

    expect(container).toMatchSnapshot();
  });

  test('WCAG 2.2 (AA) compliant', async () => {
    const { container } = render(
      <>
        <h2>Initial state</h2>
        <ForgotPasswordForm submitting={false} onSubmit={vi.fn()} onChange={vi.fn()} value={{ email: '' }} errors={{}} onBlur={vi.fn()} />
        <h2>Error state</h2>
        <ForgotPasswordForm
          submitting={false}
          onSubmit={vi.fn()}
          onChange={vi.fn()}
          value={{ email: '' }}
          errors={{ form: 'Generic error message', email: 'Email error message' }}
          onBlur={vi.fn()}
        />
      </>,
    );

    expect(await axe(container, { runOnly: ['wcag21a', 'wcag21aa', 'wcag22aa'] })).toHaveNoViolations();
  });
});
