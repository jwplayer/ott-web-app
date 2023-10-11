import React from 'react';

import Layout from './Layout';

import { renderWithRouter } from '#test/testUtils';
import { CONTROLLERS } from '#src/ioc/types';

vi.mock('#src/ioc/container', () => ({
  useController: (type: symbol) => {
    switch (type) {
      case CONTROLLERS.Profile:
        return { listProfiles: vi.fn() };
    }
  },
}));

describe('<Layout />', () => {
  test('renders layout', () => {
    const { container } = renderWithRouter(<Layout />);

    expect(container).toMatchSnapshot();
  });
});
