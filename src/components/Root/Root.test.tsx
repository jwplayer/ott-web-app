import React from 'react';
import { Route, Routes } from 'react-router';

import Root from './Root';

import { mockWindowLocation, renderWithRouter } from '#test/testUtils';

describe('<Root />', () => {
  it('renders error page when error prop is passed', () => {
    mockWindowLocation('/');
    const error = new Error();
    const { queryByText } = renderWithRouter(
      <Routes>
        <Route element={<Root error={error} />} />
      </Routes>,
    );

    expect(queryByText('generic_error_heading')).toBeDefined();
    expect(queryByText('generic_error_description')).toBeDefined();
  });
});
