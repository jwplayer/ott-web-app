import React from 'react';
import { render } from '@testing-library/react';

import ResetPasswordForm from './ResetPasswordForm';

describe('<ResetPassword>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<ResetPasswordForm onCancel={vi.fn()} onReset={vi.fn()} submitting={false} />);

    expect(container).toMatchSnapshot();
  });
});
