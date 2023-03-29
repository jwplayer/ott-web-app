import React from 'react';
import type { UseQueryResult } from 'react-query';

import { renderWithRouter } from '#test/testUtils';
import DemoConfigDialog from '#components/DemoConfigDialog/DemoConfigDialog';
import type { Config } from '#types/Config';

describe('<DemoConfigDialog>', () => {
  test('renders and matches snapshot', () => {
    const { container } = renderWithRouter(<DemoConfigDialog configQuery={{ isSuccess: true } as UseQueryResult<Config>} selectedConfigSource={'abcdefgh'} />);

    expect(container).toMatchSnapshot();
  });

  test('renders and matches snapshot error dialog', () => {
    const { container } = renderWithRouter(<DemoConfigDialog configQuery={{ isSuccess: false } as UseQueryResult<Config>} selectedConfigSource={'aaaaaaaa'} />);

    expect(container).toMatchSnapshot();
  });
});
