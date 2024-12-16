import { afterEach, beforeEach, describe, expect } from 'vitest';
import playlistFixture from '@jwp/ott-testing/fixtures/playlist.json';
import configFixture from '@jwp/ott-testing/fixtures/config.json';

import type { PlaylistItem } from '../../types/playlist';
import { mockService } from '../../test/mockService';
import ApiService from '../services/ApiService';
import GenericEntitlementService from '../services/entitlement/GenericEntitlementService';
import JWPEntitlementService from '../services/entitlement/JWPEntitlementService';
import { useConfigStore } from '../stores/ConfigStore';
import type { Config } from '../../types/config';

import AccessController from './AccessController';
import AccountController from './AccountController';
import EntitlementController from './EntitlementController';

const getAuthData = vi.fn();
const getMediaByIdAccessController = vi.fn();
const getMediaById = vi.fn();
const getMediaTokenGeneric = vi.fn();
const getMediaTokenJwp = vi.fn();
const setHost = vi.fn();

const mockMediaItem: PlaylistItem = playlistFixture.playlist[0];

// @TODO are there better ways to do this? The `mockService` util only works for `getModule` calls...
const accountController = { getAuthData } as unknown as AccountController;
const accessController = { getMediaById: getMediaByIdAccessController } as unknown as AccessController;
const apiService = { getMediaById: getMediaById } as unknown as ApiService;

const entitlementController = new EntitlementController(accountController, accessController, apiService);

const noSigningConfig = { id: 'appid', siteId: 'siteid', ...configFixture, integrations: {} } as Config;
const jwpSigningConfig = {
  id: 'appid',
  siteId: 'siteid',
  ...configFixture,
  integrations: { jwp: { assetId: 123456 } },
  custom: { urlSigning: '1' },
} as Config;
const jwpSigningDrmConfig = {
  ...jwpSigningConfig,
  custom: {},
  contentProtection: { drm: { defaultPolicyId: 'drmpolicyid' } },
} as Config;
const genericSigningConfig = {
  id: 'appid',
  siteId: 'siteid',
  ...configFixture,
  custom: { urlSigning: '1', entitlementHost: 'https://sign.jwplayer.com' },
} as Config;
const genericSigningDrmConfig = {
  ...genericSigningConfig,
  custom: { urlSigning: '1', entitlementHost: 'https://sign.jwplayer.com', drmPolicyId: 'drmpolicyid' },
} as Config;

vi.mock('../stores/ConfigStore');

describe('entitlementController', () => {
  beforeEach(() => {
    mockService(GenericEntitlementService, { getMediaToken: getMediaTokenGeneric, setHost });
    mockService(JWPEntitlementService, { getMediaToken: getMediaTokenJwp });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  describe('disabled', () => {
    test('getSignedMedia returns a media item when signing is disabled', async () => {
      getMediaById.mockResolvedValue(mockMediaItem);

      vi.mocked(useConfigStore.getState).mockReturnValue({
        config: noSigningConfig,
        settings: {
          playerId: '',
        },
        loaded: true,
        accessModel: 'AVOD',
        integrationType: null,
        supportedLanguages: [],
      });

      const result = await entitlementController.getSignedMedia('uB8aRnu6', 'en');

      expect(result?.mediaid).toEqual('uB8aRnu6');
      expect(getMediaById).toBeCalledWith({ id: 'uB8aRnu6', token: undefined, drmPolicyId: undefined, language: 'en' });

      expect(getMediaByIdAccessController).not.toBeCalled();
      expect(getMediaTokenGeneric).not.toBeCalled();
      expect(getMediaTokenJwp).not.toBeCalled();
    });
  });

  describe('JWP entitlement', () => {
    test('getSignedMedia returns a signed media item using jwp when signing is enabled', async () => {
      getMediaById.mockResolvedValue(mockMediaItem);
      getAuthData.mockResolvedValue({ jwt: 'jwttoken', refreshToken: 'refreshtoken' });
      getMediaTokenJwp.mockResolvedValue('jwpmediatoken');

      vi.mocked(useConfigStore.getState).mockReturnValue({
        config: jwpSigningConfig,
        settings: {
          playerId: '',
        },
        loaded: true,
        accessModel: 'AVOD',
        integrationType: 'jwp',
        supportedLanguages: [],
      });

      const result = await entitlementController.getSignedMedia('uB8aRnu6', 'nl');

      expect(result?.mediaid).toEqual('uB8aRnu6');
      expect(getMediaTokenJwp).toBeCalledWith(jwpSigningConfig, 'uB8aRnu6', 'jwttoken', undefined, undefined);
      expect(getMediaById).toBeCalledWith({ id: 'uB8aRnu6', token: 'jwpmediatoken', drmPolicyId: undefined, language: 'nl' });

      expect(getMediaByIdAccessController).not.toBeCalled();
      expect(getMediaTokenGeneric).not.toBeCalled();
    });

    test('getSignedMedia returns a signed media item when using jwp DRM is enabled ', async () => {
      getMediaById.mockResolvedValue(mockMediaItem);
      getAuthData.mockResolvedValue({ jwt: 'jwttoken', refreshToken: 'refreshtoken' });
      getMediaTokenJwp.mockResolvedValue('jwpmediatoken');

      vi.mocked(useConfigStore.getState).mockReturnValue({
        config: jwpSigningDrmConfig,
        settings: {
          playerId: '',
        },
        loaded: true,
        accessModel: 'AVOD',
        integrationType: 'jwp',
        supportedLanguages: [],
      });

      const result = await entitlementController.getSignedMedia('uB8aRnu6');

      expect(result?.mediaid).toEqual('uB8aRnu6');
      expect(getMediaTokenJwp).toBeCalledWith(jwpSigningDrmConfig, 'uB8aRnu6', 'jwttoken', undefined, 'drmpolicyid');
      expect(getMediaById).toBeCalledWith({ id: 'uB8aRnu6', token: 'jwpmediatoken', drmPolicyId: 'drmpolicyid' });

      expect(getMediaByIdAccessController).not.toBeCalled();
      expect(getMediaTokenGeneric).not.toBeCalled();
    });
  });

  describe('Generic entitlement', () => {
    test('getSignedMedia sets the correct entitlement host when enabled ', async () => {
      getMediaById.mockResolvedValue(mockMediaItem);
      getAuthData.mockResolvedValue({ jwt: 'jwttoken', refreshToken: 'refreshtoken' });
      getMediaTokenGeneric.mockResolvedValue('genericmediatoken');

      vi.mocked(useConfigStore.getState).mockReturnValue({
        config: genericSigningConfig,
        settings: {
          playerId: '',
        },
        loaded: true,
        accessModel: 'AVOD',
        integrationType: 'jwp',
        supportedLanguages: [],
      });

      await entitlementController.getSignedMedia('uB8aRnu6');

      expect(setHost).toBeCalledWith('https://sign.jwplayer.com');
    });

    test('getSignedMedia returns a signed media item when using generic signing is enabled ', async () => {
      getMediaById.mockResolvedValue(mockMediaItem);
      getAuthData.mockResolvedValue({ jwt: 'jwttoken', refreshToken: 'refreshtoken' });
      getMediaTokenGeneric.mockResolvedValue('genericmediatoken');

      vi.mocked(useConfigStore.getState).mockReturnValue({
        config: genericSigningConfig,
        settings: {
          playerId: '',
        },
        loaded: true,
        accessModel: 'AVOD',
        integrationType: 'jwp',
        supportedLanguages: [],
      });

      const result = await entitlementController.getSignedMedia('uB8aRnu6');

      expect(result?.mediaid).toEqual('uB8aRnu6');
      expect(setHost).toBeCalledWith('https://sign.jwplayer.com');
      expect(getMediaTokenGeneric).toBeCalledWith(genericSigningConfig, 'uB8aRnu6', 'jwttoken', undefined, undefined);
      expect(getMediaById).toBeCalledWith({ id: 'uB8aRnu6', token: 'genericmediatoken', drmPolicyId: undefined });

      expect(getMediaByIdAccessController).not.toBeCalled();
      expect(getMediaTokenJwp).not.toBeCalled();
    });

    test('getSignedMedia returns a signed media item when using generic signing is enabled with DRM ', async () => {
      getMediaById.mockResolvedValue(mockMediaItem);
      getAuthData.mockResolvedValue({ jwt: 'jwttoken', refreshToken: 'refreshtoken' });
      getMediaTokenGeneric.mockResolvedValue('genericmediatoken');

      vi.mocked(useConfigStore.getState).mockReturnValue({
        config: genericSigningDrmConfig,
        settings: {
          playerId: '',
        },
        loaded: true,
        accessModel: 'AVOD',
        integrationType: 'jwp',
        supportedLanguages: [],
      });

      const result = await entitlementController.getSignedMedia('uB8aRnu6');

      expect(result?.mediaid).toEqual('uB8aRnu6');
      expect(setHost).toBeCalledWith('https://sign.jwplayer.com');
      expect(getMediaTokenGeneric).toBeCalledWith(genericSigningDrmConfig, 'uB8aRnu6', 'jwttoken', undefined, 'drmpolicyid');
      expect(getMediaById).toBeCalledWith({ id: 'uB8aRnu6', token: 'genericmediatoken', drmPolicyId: 'drmpolicyid' });

      expect(getMediaByIdAccessController).not.toBeCalled();
      expect(getMediaTokenJwp).not.toBeCalled();
    });
  });

  describe('Access bridge', () => {
    test('getSignedMedia uses the access bridge to sign media when enabled ', async () => {
      getMediaByIdAccessController.mockResolvedValue(mockMediaItem);

      vi.mocked(useConfigStore.getState).mockReturnValue({
        config: jwpSigningConfig,
        settings: {
          playerId: '',
          apiAccessBridgeUrl: 'https://ab.jwplayer.com',
        },
        loaded: true,
        accessModel: 'AVOD',
        integrationType: 'jwp',
        supportedLanguages: [],
      });

      const result = await entitlementController.getSignedMedia('uB8aRnu6', 'de');

      expect(result?.mediaid).toEqual('uB8aRnu6');
      expect(getMediaByIdAccessController).toBeCalledWith('uB8aRnu6', 'de');
    });
  });
});
