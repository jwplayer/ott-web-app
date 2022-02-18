import React from 'react';

import { render } from '../../testUtils';
import { ConfigStore } from '../../stores/ConfigStore';

import LoginForm from './LoginForm';

describe('<LoginForm>', () => {
  test('renders and matches snapshot', () => {
    ConfigStore.update((s) => {
      s.config.sso = { host: 'https://www.aws.com', clientId: '12345CLIENT', signingService: 'http://localhost:5454' };
    });

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
