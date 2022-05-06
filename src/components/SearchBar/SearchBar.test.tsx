import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import SearchBar from './SearchBar';

describe('<SearchBar>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<SearchBar query="My search query" onQueryChange={vi.fn()} onClearButtonClick={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });

  test('uses query param to fill the search bar input', () => {
    const { getByLabelText } = render(<SearchBar query="my search query" onQueryChange={vi.fn()} />);

    expect((getByLabelText('search_bar.search_label') as HTMLInputElement).value).toEqual('my search query');
  });

  test('calls the onQueryChange callback when the user types in the search input', () => {
    const callback = vi.fn();
    const { getByLabelText } = render(<SearchBar onQueryChange={callback} />);

    const searchInput = getByLabelText('search_bar.search_label') as HTMLInputElement;

    fireEvent.change(searchInput, { target: { value: 'my search phrase' } });

    expect(callback).toBeCalled();
    expect(searchInput.value).toEqual('my search phrase');
  });

  test('shows the clear search input button when there is a query', () => {
    const callback = vi.fn();
    const { getByLabelText } = render(<SearchBar onClearButtonClick={callback} query="testing..." onQueryChange={vi.fn()} />);

    fireEvent.click(getByLabelText('search_bar.clear_search_label'));

    expect(callback).toBeCalled();
  });
});
