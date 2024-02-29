import React from 'react';
import { render } from '@testing-library/react';

import MarkdownComponent from './MarkdownComponent';

describe('<MarkdownComponent>', () => {
  test('renders and matches snapshot', () => {
    const markdownString = 'This is a test markdown string with a [testlink](https://www.example.com)';
    const { container } = render(<MarkdownComponent markdownString={markdownString} />);

    expect(container).toMatchSnapshot();
  });

  test('should create a save and valid link element', () => {
    const markdownString = 'This is a test markdown string with a [testlink](https://www.example.com)';
    const { getByText } = render(<MarkdownComponent markdownString={markdownString} />);

    expect(getByText('testlink')).toHaveAttribute('href', 'https://www.example.com');
    expect(getByText('testlink')).toHaveAttribute('rel', 'noopener');
    expect(getByText('testlink')).toHaveAttribute('target', '_blank');
  });

  test('should create a valid link element for local pages', () => {
    const markdownString = 'This is a test markdown string with a [testlink](/page)';
    const { getByText } = render(<MarkdownComponent markdownString={markdownString} />);

    expect(getByText('testlink')).toHaveAttribute('href', '/page');
    expect(getByText('testlink')).not.toHaveAttribute('rel', 'noopener');
    expect(getByText('testlink')).not.toHaveAttribute('target', '_blank');
  });
});
