import React from 'react';
import ProfileController from '@jwplayer/ott-common/src/stores/ProfileController';

import { renderWithRouter } from '../../../test/testUtils';

import Layout from './Layout';

vi.mock('@jwplayer/ott-common/src/modules/container', () => ({
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
