import React from 'react';
import { fireEvent, act, render } from '@testing-library/react';

import LoginForm from './LoginForm';

import { createWrapper, waitForWithFakeTimers } from '#test/testUtils';

vi.mock('../SocialButton/SocialButton.tsx', () => ({
  default: (props: { href: string }) => {
    return <a href={props.href}>Social Button</a>;
  },
}));

vi.mock('#src/stores/AccountController', async () => ({
  getSocialLoginUrls: vi.fn(() => [
    {
      twitter: 'https://staging-v2.inplayer.com/',
    },
    {
      facebook: 'https://www.facebook.com/',
    },
    {
      google: 'https://accounts.google.com/',
    },
  ]),
}));

describe('<LoginForm>', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('renders and matches snapshot', async () => {
    const { container } = render(
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
      { wrapper: createWrapper() },
    );

    await waitForWithFakeTimers();

    expect(container).toMatchSnapshot();
  });

  test('sets the correct values in the form fields', async () => {
    const { getByLabelText } = render(
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
      { wrapper: createWrapper() },
    );

    await waitForWithFakeTimers();

    expect(getByLabelText('login.email')).toHaveValue('myemail@email.com');
    expect(getByLabelText('login.password')).toHaveValue('mypassword');
  });

  test('sets the correct errors in the form fields', async () => {
    const { queryByText } = render(
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
      { wrapper: createWrapper() },
    );

    await waitForWithFakeTimers();

    expect(queryByText('Email error')).toBeDefined();
    expect(queryByText('Password error')).toBeDefined();
    expect(queryByText('Form error')).toBeDefined();
  });

  test('disables the submit button when submitting is true', async () => {
    const { getByRole } = render(
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
      { wrapper: createWrapper() },
    );

    await waitForWithFakeTimers();

    expect(getByRole('button', { name: 'login.sign_in' })).toBeDisabled();
  });

  test('calls the onSubmit callback when the form gets submitted', async () => {
    const onSubmit = vi.fn();

    const { getByTestId } = render(
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
      { wrapper: createWrapper() },
    );

    act(() => {
      fireEvent.submit(getByTestId('login-form'));
    });

    await waitForWithFakeTimers();

    expect(onSubmit).toBeCalled();
  });

  test('calls the onChange callback when a text field changes', async () => {
    const onChange = vi.fn();

    const { getByLabelText } = render(
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
      { wrapper: createWrapper() },
    );

    act(() => {
      fireEvent.change(getByLabelText('login.email'), { target: { value: 'email' } });
      fireEvent.change(getByLabelText('login.password'), { target: { value: 'password' } });
    });

    await waitForWithFakeTimers();

    expect(onChange).toBeCalledTimes(2);
  });
});
