import React from 'react';
import { render } from '@testing-library/react';

import Shelf from './Shelf';

describe('Playlist Component tests', () => {
  test.skip('dummy test', () => {
    render(
        <Shelf playlistId={'test'} ></Shelf>
      );
    // expect(screen.getByText('hello world')).toBeInTheDocument();
  });
});
