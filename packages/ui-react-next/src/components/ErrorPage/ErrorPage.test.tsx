import React from 'react';
import { axe } from 'vitest-axe';
import { render } from '@testing-library/react';

import ErrorPage from './ErrorPage';

describe('<ErrorPage>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<ErrorPage title="This is the title">This is the content</ErrorPage>);

    expect(container).toMatchSnapshot();
  });

  test('WCAG 2.2 (AA) compliant', async () => {
    const { container } = render(<ErrorPage title="This is the title">This is the content</ErrorPage>);

    expect(await axe(container, { runOnly: ['wcag21a', 'wcag21aa', 'wcag22aa'] })).toHaveNoViolations();
  });
});
