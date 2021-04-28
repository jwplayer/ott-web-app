import React from 'react';
import { render, screen } from '@testing-library/react';

import Base from './Base';

describe('Base Component tests', () => {
  test('dummy test', () => {
    render(<Base></Base>);
    expect(screen.getByText('hello world')).toBeInTheDocument();
  });
});
