import React from 'react';
import { act, fireEvent, render } from '@testing-library/react';
import AccountController from '@jwp/ott-common/src/stores/AccountController';
import { mockService } from '@jwp/ott-common/test/mockService';
import { DEFAULT_FEATURES } from '@jwp/ott-common/src/constants';

import { createWrapper, waitForWithFakeTimers } from '../../../test/utils';

import LoginForm from './LoginForm';

// The SocialButton component contains an SVG import that results in an absolute path on the current machine
// This results in snapshot inconsistencies per machine
vi.mock('../SocialButton/SocialButton.tsx', () => ({
  default: (props: { href: string }) => {
    return <a href={props.href}>Social Button</a>;
  },
}));

describe('<LoginForm>', () => {
  beforeEach(() => {
    vi.useFakeTimers();

    // TODO: remove AccountController from component
    mockService(AccountController, {
      getFeatures: () => DEFAULT_FEATURES,
      getSocialLoginUrls: vi.fn().mockImplementation(() =>
        Promise.resolve([
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
      ),
    });
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
        messageKey={null}
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
        messageKey={null}
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
        messageKey={null}
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
        messageKey={null}
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
        messageKey={null}
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
        messageKey={null}
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
