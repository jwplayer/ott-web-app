import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import type { Offer } from '@jwp/ott-common/types/checkout';
import monthlyOffer from '@jwp/ott-testing/fixtures/monthlyOffer.json';
import yearlyOffer from '@jwp/ott-testing/fixtures/yearlyOffer.json';
import tvodOffer from '@jwp/ott-testing/fixtures/tvodOffer.json';

import ChooseOfferForm from './ChooseOfferForm';

const svodOffers = [monthlyOffer, yearlyOffer] as Offer[];
const tvodOffers = [tvodOffer] as Offer[];

describe('<OffersForm>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(
      <ChooseOfferForm
        values={{ offerId: 'S916977979_NL' }}
        errors={{}}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        submitting={false}
        offers={svodOffers}
        offerType={'svod'}
        setOfferType={vi.fn()}
      />,
    );

    expect(container).toMatchSnapshot();
  });

  test('renders and matches snapshot', () => {
    const { container } = render(
      <ChooseOfferForm
        values={{ offerId: 'R892134629_NL' }}
        errors={{}}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        submitting={false}
        offers={tvodOffers}
        offerType={'tvod'}
        setOfferType={vi.fn()}
      />,
    );

    expect(container).toMatchSnapshot();
  });

  test('checks the monthly offer correctly', () => {
    const { getByTestId } = render(
      <ChooseOfferForm
        values={{ offerId: 'S916977979_NL' }}
        errors={{}}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        submitting={false}
        offers={svodOffers}
        offerType={'svod'}
        setOfferType={vi.fn()}
      />,
    );

    expect(getByTestId('choose_offer.monthly')).toBeChecked();
  });

  test('checks the yearly offer correctly', () => {
    const { getByTestId } = render(
      <ChooseOfferForm
        values={{ offerId: 'S345569153_NL' }}
        errors={{}}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        submitting={false}
        offers={svodOffers}
        offerType={'svod'}
        setOfferType={vi.fn()}
      />,
    );

    expect(getByTestId('choose_offer.yearly')).toBeChecked();
  });

  test('checks the tvod offer correctly', () => {
    const { getByTestId } = render(
      <ChooseOfferForm
        values={{ offerId: 'R892134629_NL' }}
        errors={{}}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        submitting={false}
        offers={tvodOffers}
        offerType={'tvod'}
        setOfferType={vi.fn()}
      />,
    );

    expect(getByTestId('One Time - TVOD offer')).toBeChecked();
  });

  test('calls the onChange callback when changing the offer', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(
      <ChooseOfferForm
        values={{ offerId: 'S916977979_NL' }}
        errors={{}}
        onChange={onChange}
        onSubmit={vi.fn()}
        submitting={false}
        offers={svodOffers}
        offerType={'svod'}
        setOfferType={vi.fn()}
      />,
    );

    fireEvent.click(getByTestId('choose_offer.yearly'));

    expect(onChange).toBeCalled();
  });

  test('calls the onSubmit callback when submitting the form', () => {
    const onSubmit = vi.fn();
    const { getByTestId } = render(
      <ChooseOfferForm
        values={{ offerId: 'S916977979_NL' }}
        errors={{}}
        onChange={vi.fn()}
        onSubmit={onSubmit}
        submitting={false}
        offers={svodOffers}
        offerType={'svod'}
        setOfferType={vi.fn()}
      />,
    );

    fireEvent.submit(getByTestId('choose-offer-form'));

    expect(onSubmit).toBeCalled();
  });
});
