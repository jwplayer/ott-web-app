import React, { act } from 'react';
import type { Playlist, PlaylistItem } from '@jwp/ott-common/types/playlist';
import type { Config } from '@jwp/ott-common/types/config';
import type { PaymentDetail, Subscription, Transaction } from '@jwp/ott-common/types/subscription';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { useFavoritesStore } from '@jwp/ott-common/src/stores/FavoritesStore';
import AccountController from '@jwp/ott-common/src/controllers/AccountController';
import { mockService } from '@jwp/ott-common/test/mockService';
import ApiService from '@jwp/ott-common/src/services/ApiService';
import FavoritesController from '@jwp/ott-common/src/controllers/FavoritesController';
import CheckoutController from '@jwp/ott-common/src/controllers/CheckoutController';
import { ACCESS_MODEL, DEFAULT_FEATURES } from '@jwp/ott-common/src/constants';
import { Route, Routes } from 'react-router-dom';

import { mockWindowLocation, renderWithRouter } from '../../../test/utils';

import User from './User';

const data = {
  loading: false,
  user: {
    id: 'user1',
    email: 'user@jwplayer.com',
    country: 'us',
    firstName: 'User',
    lastName: 'Person',
    lastUserIp: '192.0.0.1',
    metadata: {},
  },
  subscription: {
    subscriptionId: 90210,
    offerId: 'offer1111',
    expiresAt: 1767994,
    status: 'active',
    nextPaymentPrice: 199.99,
    nextPaymentCurrency: 'USD',
    paymentGateway: '',
    paymentMethod: 'Paypal',
    offerTitle: 'Your Cool Subscription',
    period: 'year',
    totalPrice: 99.95,
  } as Subscription,
  transactions: [
    {
      transactionId: '11232',
      offerId: 'offer1111',
      paymentMethod: 'Ideal',
      offerTitle: 'Your Cool Subscription',
      transactionPriceInclTax: 12.88,
      transactionCurrency: 'EUR',
      customerCountry: 'nl',
      transactionDate: '1657994000',
    } as unknown as Transaction,
    {
      transactionId: '11234',
      offerId: 'offer13',
      paymentMethod: 'Cash',
      offerTitle: 'Your Cool Subscription',
      transactionPriceInclTax: 12.88,
      transactionCurrency: 'EUR',
      customerCountry: 'uk',
      transactionDate: '1667990000',
    } as unknown as Transaction,
  ],
  activePayment: {
    id: 887765,
    paymentMethodSpecificParams: {
      lastCardFourDigits: '9888',
      cardExpirationDate: '03/30',
    },
  } as unknown as PaymentDetail,
};

describe('User Component tests', () => {
  beforeEach(() => {
    mockService(ApiService, {});
    mockService(AccountController, {
      logout: vi.fn(),
      getPublisherConsents: vi.fn().mockResolvedValue([]),
      getFeatures: vi.fn(() => ({
        ...DEFAULT_FEATURES,
        canUpdateEmail: false,
        canRenewSubscription: false,
      })),
    });
    mockService(FavoritesController, { clear: vi.fn() });
    mockService(CheckoutController, {
      initialiseOffers: vi.fn().mockResolvedValue([]),
      getSubscriptionSwitches: vi.fn(),
      getSubscriptionOfferIds: vi.fn().mockReturnValue([]),
    });

    useConfigStore.setState({
      accessModel: ACCESS_MODEL.SVOD,
    });
  });

  test('Account Page', () => {
    act(() => {
      useAccountStore.setState(data);
      mockWindowLocation('u/my-account');
    });
    const { container } = renderWithRouter(
      <Routes>
        <Route path="/u/*" element={<User />} />
      </Routes>,
    );

    expect(container).toMatchSnapshot();
  });

  test('Payments Page', async () => {
    act(() => {
      useAccountStore.setState(data);
      mockWindowLocation('u/payments');
    });
    const { container } = await act(() =>
      renderWithRouter(
        <Routes>
          <Route path="/u/*" element={<User />} />
        </Routes>,
      ),
    );

    expect(container).toMatchSnapshot();
  });

  test('Favorites Page', () => {
    act(() => {
      useAccountStore.setState(data);
      useConfigStore.setState({
        config: {
          features: {
            favoritesList: 'abcdefgh',
          },
          styling: {},
        } as unknown as Config,
      });
      useFavoritesStore.setState({
        getPlaylist: (): Playlist => {
          return {
            title: 'These are my favorite things',
            playlist: [
              {
                mediaid: 'aaabbbcc',
                title: 'Fav 1',
                duration: 12,
                feedid: 'abcdffff',
              } as unknown as PlaylistItem,
              {
                mediaid: 'aaabbbcd',
                title: 'Big Buck Bunny',
                duration: 6000,
                feedid: 'bbbdddff',
              } as unknown as PlaylistItem,
              {
                mediaid: 'ggaaccvv',
                title: 'My last favorite',
                duration: 659,
                feedid: 'bbbbbbbb',
              } as unknown as PlaylistItem,
            ],
          };
        },
      });
      mockWindowLocation('u/favorites');
    });

    const { container } = renderWithRouter(
      <Routes>
        <Route path="/u/*" element={<User />} />
      </Routes>,
    );

    expect(container).toMatchSnapshot();
  });
});
