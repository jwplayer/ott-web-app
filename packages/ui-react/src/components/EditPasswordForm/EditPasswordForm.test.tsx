import React from 'react';
import { axe } from 'vitest-axe';
import { render } from '@testing-library/react';

import EditPasswordForm from './EditPasswordForm';

describe('<EditPasswordForm>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(
      <EditPasswordForm
        submitting={false}
        onSubmit={vi.fn()}
        onChange={vi.fn()}
        onBlur={vi.fn()}
        value={{ password: '', passwordConfirmation: '' }}
        errors={{}}
      />,
    );

    expect(container).toMatchSnapshot();
  });

  test('WCAG 2.2 (AA) compliant', async () => {
    const { container } = render(
      <>
        <h2>Initial state</h2>
        <EditPasswordForm
          submitting={false}
          onSubmit={vi.fn()}
          onChange={vi.fn()}
          onBlur={vi.fn()}
          value={{ password: '', passwordConfirmation: '' }}
          errors={{}}
        />
        <h2>Error state</h2>
        <EditPasswordForm
          submitting={false}
          onSubmit={vi.fn()}
          onChange={vi.fn()}
          onBlur={vi.fn()}
          value={{ password: '', passwordConfirmation: '' }}
          errors={{ form: 'Generic error message', email: 'Email error message', password: 'Password error message' }}
        />
      </>,
    );

    expect(await axe(container, { runOnly: ['wcag21a', 'wcag21aa', 'wcag22aa'] })).toHaveNoViolations();
  });
});
