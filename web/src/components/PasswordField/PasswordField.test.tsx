import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import PasswordField from './PasswordField';

describe('<PasswordField>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<PasswordField label="Label" placeholder="Placeholder" name="password" value="" onChange={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });

  test('triggers an onChange event when the input value changes', () => {
    const onChange = vi.fn();
    const { getByPlaceholderText } = render(<PasswordField name="password" value="" onChange={onChange} placeholder="Enter your password" />);

    fireEvent.change(getByPlaceholderText('Enter your password'), { target: { value: 'mypassword' } });

    expect(onChange).toBeCalled();
  });

  test('shows the helper text below the input', () => {
    const { queryByText } = render(<PasswordField name="password" value="" onChange={vi.fn()} showHelperText={true} />);
    expect(queryByText('reset.password_helper_text')).not.toBeNull();
  });

  test('not shows the helper text below the input', () => {
    const { queryByText } = render(<PasswordField name="password" value="" onChange={vi.fn()} showHelperText={false} />);
    expect(queryByText('reset.password_helper_text')).toBeNull();
  });
});
