import React from 'react';
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
});
