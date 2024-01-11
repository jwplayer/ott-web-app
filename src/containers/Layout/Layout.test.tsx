import React from 'react';

import Layout from './Layout';

import { renderWithRouter } from '#test/testUtils';
import ProfileController from '#src/stores/ProfileController';

vi.mock('#src/modules/container', () => ({
  getModule: (type: typeof ProfileController) => {
    switch (type) {
      case ProfileController:
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
