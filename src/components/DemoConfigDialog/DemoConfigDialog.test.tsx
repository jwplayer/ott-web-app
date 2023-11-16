import React from 'react';

import { renderWithRouter } from '#test/testUtils';
import DemoConfigDialog from '#components/DemoConfigDialog/DemoConfigDialog';

describe('<DemoConfigDialog>', () => {
  test('renders and matches snapshot', () => {
    const query = {
      isSuccess: true,
      error: null,
      isLoading: false,
      data: { configSource: 'abcdefgh', config: {}, settings: {} },
      refetch: () => Promise.resolve(null),
    };

    // @ts-expect-error
    const { container } = renderWithRouter(<DemoConfigDialog query={query} />);

    expect(container).toMatchSnapshot();
  });

  test('renders and matches snapshot error dialog', () => {
    const query = {
      isSuccess: false,
      error: new Error('smth'),
      isLoading: false,
      data: { configSource: 'aaaaaaaa', config: {}, settings: {} },
      refetch: () => Promise.resolve(null),
    };

    // @ts-expect-error
    const { container } = renderWithRouter(<DemoConfigDialog query={query} />);

    expect(container).toMatchSnapshot();
  });
});
