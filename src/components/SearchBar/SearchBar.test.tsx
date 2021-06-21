import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import SearchBar from './SearchBar';

describe('<SearchBar>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<SearchBar query="My search query" onQueryChange={jest.fn()} onClearButtonClick={jest.fn()} />);

    expect(container).toMatchSnapshot();
  });

  test('uses query param to fill the search bar input', () => {
    const { getByLabelText } = render(<SearchBar query="my search query" onQueryChange={jest.fn()} />);

    expect((getByLabelText('Search') as HTMLInputElement).value).toEqual('my search query');
  });

  test('calls the onQueryChange callback when the user types in the search input', () => {
    const callback = jest.fn();
    const { getByLabelText } = render(<SearchBar onQueryChange={callback} />);

    const searchInput = getByLabelText('Search') as HTMLInputElement;

    fireEvent.change(searchInput, { target: { value: 'my search phrase' } });

    expect(callback).toBeCalled();
    expect(searchInput.value).toEqual('my search phrase');
  });

  test('shows the clear search input button when there is a query', () => {
    const callback = jest.fn();
    const { getByLabelText } = render(<SearchBar onClearButtonClick={callback} query="testing..." onQueryChange={jest.fn()} />);

    fireEvent.click(getByLabelText('Clear search'));

    expect(callback).toBeCalled();
  });
});
