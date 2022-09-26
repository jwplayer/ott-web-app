import * as React from 'react';
import { render } from '@testing-library/react';

import CardGrid from './CardGrid';

import { generatePlaylistPlaceholder } from '#src/utils/collection';

describe('<CardGrid>', () => {
  it('renders and matches snapshot', () => {
    const placeholderData = generatePlaylistPlaceholder();
    const { container } = render(
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
