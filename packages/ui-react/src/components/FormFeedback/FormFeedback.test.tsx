import React from 'react';
import { render } from '@testing-library/react';

import FormFeedback from './FormFeedback';

describe('<FormFeedback>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<FormFeedback variant="error">Form feedback</FormFeedback>);

    expect(container).toMatchSnapshot();
  });
});
