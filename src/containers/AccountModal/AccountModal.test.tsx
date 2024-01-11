import React from 'react';

import AccountModal from './AccountModal';

import { renderWithRouter } from '#test/testUtils';
import AccountController from '#src/stores/AccountController';

vi.mock('#src/modules/container', () => ({
  getModule: (type: typeof AccountController) => {
    switch (type) {
      case AccountController:
        return {};
    }
  },
}));

describe('<AccountModal>', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders and matches snapshot', () => {
    const { container } = renderWithRouter(<AccountModal />);

    expect(container).toMatchSnapshot();
  });
});
