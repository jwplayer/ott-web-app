import React from 'react';
import { render } from '@testing-library/react';

import MarkdownComponent from './MarkdownComponent';

describe('<MarkdownComponent>', () => {
  test('renders and matches snapshot', () => {
    const markdownString = 'This is a test markdown string with a [testlink](https://www.example.com)';
    const { container } = render(<MarkdownComponent markdownString={markdownString} />);

    expect(container).toMatchSnapshot();
  });
  test('marks a link', () => {
    const markdownString = 'This is a test markdown string with a [testlink](https://www.example.com)';
    const { container } = render(<MarkdownComponent markdownString={markdownString} />);

    expect(container).toContainHTML('<a href');
  });
});
