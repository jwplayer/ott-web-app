import * as React from 'react';

import CardGrid from './CardGrid';

import { generatePlaylistPlaceholder } from '#src/utils/collection';
import { renderWithRouter } from '#test/testUtils';

describe('<CardGrid>', () => {
  it('renders and matches snapshot', () => {
    const placeholderData = generatePlaylistPlaceholder();
    const { container } = renderWithRouter(
      <CardGrid
        playlist={placeholderData}
        onCardHover={vi.fn()}
        onCardClick={vi.fn()}
        isLoading={false}
        accessModel={'SVOD'}
        isLoggedIn={true}
        hasSubscription={true}
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
