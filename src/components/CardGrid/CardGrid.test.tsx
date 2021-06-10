import * as React from 'react';
import { render } from '@testing-library/react';

import { generatePlaylistPlaceholder } from '../../utils/collection';

import CardGrid from './CardGrid';

describe('<CardGrid>', () => {
  it('renders and matches snapshot', () => {
    const placeholderData = generatePlaylistPlaceholder();
    const { container } = render((
      <CardGrid playlist={placeholderData.playlist} onCardHover={jest.fn()} onCardClick={jest.fn()} isLoading={false} />
    ));

    expect(container).toMatchSnapshot();
  });
});
