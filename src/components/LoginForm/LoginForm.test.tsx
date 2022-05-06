import React from 'react';
import { fireEvent } from '@testing-library/react';

import LoginForm from './LoginForm';

import { renderWithRouter } from '#test/testUtils';

describe('<LoginForm>', () => {
  test('renders and matches snapshot', () => {
    const { container } = renderWithRouter(
      <LoginForm
        onSubmit={vi.fn()}
        onChange={vi.fn()}
        values={{
          email: '',
          password: '',
        }}
        errors={{}}
        submitting={false}
      />,
    );

    expect(container).toMatchSnapshot();
  });

  test('sets the correct values in the form fields', () => {
    const { getByLabelText } = renderWithRouter(
      <LoginForm
        onSubmit={vi.fn()}
        onChange={vi.fn()}
        values={{
          email: 'myemail@email.com',
          password: 'mypassword',
        }}
        errors={{}}
        submitting={false}
      />,
    );

    expect(getByLabelText('login.email')).toHaveValue('myemail@email.com');
    expect(getByLabelText('login.password')).toHaveValue('mypassword');
  });

  test('sets the correct errors in the form fields', () => {
    const { queryByText } = renderWithRouter(
      <LoginForm
        onSubmit={vi.fn()}
        onChange={vi.fn()}
        values={{
          email: 'myemail@email.com',
          password: 'mypassword',
        }}
        errors={{ email: 'Email error', password: 'Password error', form: 'Form error' }}
        submitting={false}
      />,
    );

    expect(queryByText('Email error')).toBeDefined();
    expect(queryByText('Password error')).toBeDefined();
    expect(queryByText('Form error')).toBeDefined();
  });

  test('disables the submit button when submitting is true', () => {
    const { getByRole } = renderWithRouter(
      <LoginForm
        onSubmit={vi.fn()}
        onChange={vi.fn()}
        values={{
          email: 'myemail@email.com',
          password: 'mypassword',
        }}
        errors={{}}
        submitting={true}
      />,
    );

    expect(getByRole('button', { name: 'login.sign_in' })).toBeDisabled();
  });

  test('calls the onSubmit callback when the form gets submitted', () => {
    const onSubmit = vi.fn();
    const { getByTestId } = renderWithRouter(
      <LoginForm
        onSubmit={onSubmit}
        onChange={vi.fn()}
        values={{
          email: 'myemail@email.com',
          password: 'mypassword',
        }}
        errors={{}}
        submitting={true}
      />,
    );

    fireEvent.submit(getByTestId('login-form'));

    expect(onSubmit).toBeCalled();
  });

  test('calls the onChange callback when a text field changes', () => {
    const onChange = vi.fn();
    const { getByLabelText } = renderWithRouter(
      <LoginForm
        onSubmit={vi.fn()}
        onChange={onChange}
        values={{
          email: '',
          password: '',
        }}
        errors={{}}
        submitting={true}
      />,
    );

    fireEvent.change(getByLabelText('login.email'), { target: { value: 'email' } });
    fireEvent.change(getByLabelText('login.password'), { target: { value: 'password' } });

    expect(onChange).toBeCalledTimes(2);
  });
});
