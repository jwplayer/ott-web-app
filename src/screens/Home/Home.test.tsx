import React from 'react';
import { render, screen } from '@testing-library/react';

import Home from './Home';

describe('Home Component tests', () => {
  test('dummy test', () => {
    render(<Home></Home>);
    // expect(screen.getByText('hello world')).toBeInTheDocument();
  });
});
