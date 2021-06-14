import React from 'react';
import { render } from '@testing-library/react';

import ErrorPage from './ErrorPage';

describe('<ErrorPage>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<ErrorPage title="This is the title">This is the content</ErrorPage>);

    expect(container).toMatchSnapshot();
  });
});
