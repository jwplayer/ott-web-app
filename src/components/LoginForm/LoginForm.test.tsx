import React from 'react';

import { render } from '../../testUtils';

import LoginForm from './LoginForm';

describe('<LoginForm>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(
      <LoginForm
        onSubmit={jest.fn()}
        onChange={jest.fn()}
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
});
