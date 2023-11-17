import React from 'react';
import { act, fireEvent, render } from '@testing-library/react';
import AccountController from '@jwplayer/ott-common/src/stores/AccountController';

import { createWrapper, waitForWithFakeTimers } from '../../../test/testUtils';

import LoginForm from './LoginForm';

vi.mock('@jwplayer/ott-common/src/modules/container', () => ({
  getModule: (type: typeof AccountController) => {
    switch (type) {
      case AccountController:
        return {
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
        };
    }
  },
}));

vi.mock('../SocialButton/SocialButton.tsx', () => ({
  default: (props: { href: string }) => {
    return <a href={props.href}>Social Button</a>;
  },
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
