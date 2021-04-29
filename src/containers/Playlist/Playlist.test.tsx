import * as React from 'react';
import { render } from '@testing-library/react';

import Playlist from './Playlist';

describe('<Playlist>', () => {
    it.skip('renders with heading', () => {
        const { getByText } = render(<Playlist playlistId="123" />);
        expect(getByText(/aa/i)).toBeTruthy();
    });
});
