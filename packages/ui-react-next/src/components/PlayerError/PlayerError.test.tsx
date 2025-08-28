import React from 'react';
import { render } from '@testing-library/react';

import PlayerError, { PlayerErrorState } from './PlayerError';

describe('<ErrorPage>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<PlayerError error={PlayerErrorState.GEO_BLOCKED} />);

    expect(container).toMatchSnapshot();
  });
});
