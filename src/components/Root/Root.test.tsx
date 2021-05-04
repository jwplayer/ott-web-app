import React from 'react';

import { mockWindowLocation, render } from '../../testUtils';

import Root from './Root';

describe('<Root />', () => {
  it('renders and matches snapshot', () => {
    mockWindowLocation('/');
    const { container } = render(<Root />);

    expect(container).toMatchSnapshot();
  });

  it('renders error page when error prop is passed', () => {
    mockWindowLocation('/');
    const error = new Error();
    const { container } = render(<Root error={error} />);

    expect(container).toMatchSnapshot();
  });
});
