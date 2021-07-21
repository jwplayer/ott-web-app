import React from 'react';

import { mockWindowLocation, render } from '../../testUtils';

import Root from './Root';

describe('<Root />', () => {
  it('renders error page when error prop is passed', () => {
    mockWindowLocation('/');
    const error = new Error();
    const { queryByText } = render(<Root error={error} />);

    expect(queryByText('generic_error_heading')).toBeDefined();
    expect(queryByText('generic_error_description')).toBeDefined();
  });
});
