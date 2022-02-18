import React from 'react';

import { render } from '../../testUtils';
import { ConfigStore } from '../../stores/ConfigStore';

import UserMenu from './UserMenu';

describe('<UserMenu>', () => {
  test('renders and matches snapshot', () => {
    ConfigStore.update((s) => {
      s.config.sso = { host: 'https://www.aws.com', clientId: '12345CLIENT', signingService: 'localhost' };
    });

    const { container } = render(<UserMenu showPaymentsItem={true} />);

    expect(container).toMatchSnapshot();
  });
});
