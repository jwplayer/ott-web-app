import InPlayer, { Env } from '@inplayer-org/inplayer.js';
import i18next from 'i18next';
import { inject, injectable } from 'inversify';

import { formatConsentsToRegisterFields } from '../../../utils/collection';
import type {
  AuthData,
  ChangePassword,
  ChangePasswordWithOldPassword,
  CustomFormField,
  Customer,
  CustomerConsent,
  CustomRegisterFieldVariant,
  DeleteAccount,
  ExportAccountData,
  GetCaptureStatus,
  GetCustomerConsents,
  GetPublisherConsents,
  Login,
  NotificationsData,
  Register,
  ResetPassword,
  GetSocialURLs,
  UpdateCaptureAnswers,
  UpdateCustomerArgs,
  UpdateCustomerConsents,
  UpdateFavorites,
  UpdateWatchHistory,
  UpdateCustomer,
} from '../../../../types/account';
import type { AccessModel, Config } from '../../../../types/config';
import type { SerializedFavorite } from '../../../../types/favorite';
import type { SerializedWatchHistoryItem } from '../../../../types/watchHistory';
import AccountService from '../AccountService';
import StorageService from '../../StorageService';
import { ACCESS_MODEL } from '../../../constants';

import type {
  JWPAuthData,
  GetRegisterFieldsResponse,
  RegisterField,
  CreateAccount,
  AccountData,
  CommonResponse,
  GetWatchHistoryResponse,
  WatchHistory,
  FavoritesData,
  GetFavoritesResponse,
  ListSocialURLs,
} from './types';
import JWPAPIService from './JWPAPIService';

enum InPlayerEnv {
  Development = 'development',
  Production = 'production',
  Daily = 'daily',
}

const JW_TERMS_URL = 'https://inplayer.com/legal/terms';

@injectable()
export default class JWPAccountService extends AccountService {
  protected readonly storageService;
  protected readonly apiService;

  protected clientId = '';

  accessModel: AccessModel = ACCESS_MODEL.AUTHVOD;
  assetId: number | null = null;
  svodOfferIds: string[] = [];
  sandbox = false;

  constructor(@inject(StorageService) storageService: StorageService, @inject(JWPAPIService) apiService: JWPAPIService) {
    super({
      canUpdateEmail: false,
      canSupportEmptyFullName: false,
      canChangePasswordWithOldPassword: true,
      canRenewSubscription: false,
      canExportAccountData: true,
      canUpdatePaymentMethod: false,
      canShowReceipts: true,
      canDeleteAccount: true,
      hasNotifications: true,
      hasSocialURLs: true,
      // Limit of media_ids length passed to the /apps/watchlists endpoint
      watchListSizeLimit: 48,
    });

    this.storageService = storageService;
    this.apiService = apiService;
  }

  private parseJson = (value: string, fallback = {}) => {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  private formatFavorite = (favorite: FavoritesData): SerializedFavorite => {
    return {
      mediaid: favorite.media_id,
    };
  };

  private formatHistoryItem = (history: WatchHistory): SerializedWatchHistoryItem => {
    return {
      mediaid: history.media_id,
      progress: history.progress,
    };
  };

  private formatAccount = (account: AccountData): Customer => {
    const { id, uuid, email, full_name: fullName, metadata, created_at: createdAt } = account;
    const regDate = new Date(createdAt * 1000).toLocaleString();

    const firstName = metadata?.first_name as string;
    const lastName = metadata?.surname as string;

    return {
      id: id.toString(),
      uuid,
      email,
      fullName,
      firstName,
      lastName,
      metadata,
      regDate,
      country: '',
      lastUserIp: '',
    };
  };

  private formatAuth(auth: JWPAuthData): AuthData {
    const { access_token: jwt } = auth;
    return {
      jwt,
      refreshToken: '',
    };
  }

  initialize = async (config: Config, url: string, _logoutFn: () => Promise<void>) => {
    const jwpConfig = config.integrations?.jwp;

    if (!jwpConfig?.clientId) {
      throw new Error('Failed to initialize JWP integration. The clientId is missing.');
    }

    // set environment
    this.sandbox = !!jwpConfig.useSandbox;

    const env: string = this.sandbox ? InPlayerEnv.Development : InPlayerEnv.Production;
    InPlayer.setConfig(env as Env);

    this.apiService.setup(this.sandbox);

    // calculate access model
    if (jwpConfig.clientId) {
      this.clientId = jwpConfig.clientId;
    }

    if (jwpConfig.assetId) {
      this.accessModel = ACCESS_MODEL.SVOD;
      this.assetId = jwpConfig.assetId;
      this.svodOfferIds = jwpConfig.assetId ? [String(jwpConfig.assetId)] : [];
    }

    // restore session from URL params
    const queryParams = new URLSearchParams(url.split('#')[1]);
    const token = queryParams.get('token');
    const refreshToken = queryParams.get('refresh_token');
    const expires = queryParams.get('expires');

    if (!token || !refreshToken || !expires) {
      return;
    }

    this.apiService.setToken(token, refreshToken, parseInt(expires));
  };

  getAuthData = async () => {
    if (await this.apiService.isAuthenticated()) {
      const credentials = await this.apiService.getToken();

      return {
        jwt: credentials.token,
        refreshToken: credentials.refreshToken,
      } as AuthData;
    }

    return null;
  };

  getPublisherConsents: GetPublisherConsents = async () => {
    try {
      const data = await this.apiService.get<GetRegisterFieldsResponse>(`/accounts/register-fields/${this.clientId}`);

      const terms = data?.collection.find(({ name }) => name === 'terms');

      const result = data?.collection
        // we exclude these fields because we already have them by default
        .filter((field) => !['email_confirmation', 'first_name', 'surname'].includes(field.name) && ![terms].includes(field))
        .map(
          (field): CustomFormField => ({
            type: field.type as CustomRegisterFieldVariant,
            isCustomRegisterField: true,
            name: field.name,
            label: field.label,
            placeholder: field.placeholder,
            required: field.required,
            options: field.options,
            defaultValue: '',
            version: '1',
            ...(field.type === 'checkbox'
              ? {
                  enabledByDefault: field.default_value === 'true',
                }
              : {
                  defaultValue: field.default_value,
                }),
          }),
        );

      return terms ? [this.getTermsConsent(terms), ...result] : result;
    } catch {
      throw new Error('Failed to fetch publisher consents.');
    }
  };

  getCustomerConsents: GetCustomerConsents = async (payload) => {
    try {
      if (!payload?.customer) {
        return {
          consents: [],
        };
      }

      const { customer } = payload;

      return this.parseJson(customer.metadata?.consents as string, []);
    } catch {
      throw new Error('Unable to fetch Customer consents.');
    }
  };

  updateCustomerConsents: UpdateCustomerConsents = async (payload) => {
    try {
      const { customer, consents } = payload;

      const existingAccountData = this.formatUpdateAccount(customer);

      const params = {
        ...existingAccountData,
        metadata: {
          ...existingAccountData.metadata,
          ...formatConsentsToRegisterFields(consents),
          consents: JSON.stringify(consents),
        },
      };

      const data = await this.apiService.put<AccountData>('/accounts', params, { withAuthentication: true });

      return this.parseJson(data?.metadata?.consents as string, []);
    } catch {
      throw new Error('Unable to update Customer consents');
    }
  };

  updateCaptureAnswers: UpdateCaptureAnswers = async ({ customer, ...newAnswers }) => {
    return this.updateCustomer({ ...customer, ...newAnswers });
  };

  changePasswordWithOldPassword: ChangePasswordWithOldPassword = async (payload) => {
    const { oldPassword, newPassword, newPasswordConfirmation } = payload;

    try {
      await this.apiService.post<void>(
        '/accounts/change-password',
        {
          old_password: oldPassword,
          password: newPassword,
          password_confirmation: newPasswordConfirmation,
        },
        { withAuthentication: true },
      );
    } catch (error: unknown) {
      if (JWPAPIService.isCommonError(error)) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to change password');
    }
  };

  resetPassword: ResetPassword = async ({ customerEmail }) => {
    try {
      await this.apiService.post<CommonResponse>('/accounts/forgot-password', {
        email: customerEmail,
        merchant_uuid: this.clientId,
        branding_id: 0,
      });
    } catch {
      throw new Error('Failed to reset password.');
    }
  };

  login: Login = async ({ email, password, referrer }) => {
    try {
      const data = await this.apiService.post<CreateAccount>('/v2/accounts/authenticate', {
        client_id: this.clientId || '',
        grant_type: 'password',
        referrer,
        username: email,
        password,
      });

      this.apiService.setToken(data.access_token, '', data.expires);

      const user = this.formatAccount(data.account);

      return {
        auth: this.formatAuth(data),
        user,
        customerConsents: this.parseJson(user?.metadata?.consents as string, []),
      };
    } catch {
      throw new Error('Failed to authenticate user.');
    }
  };

  register: Register = async ({ email, password, referrer, consents }) => {
    try {
      const data = await this.apiService.post<CreateAccount>('/accounts', {
        full_name: email,
        username: email,
        password,
        password_confirmation: password,
        client_id: this.clientId || '',
        type: 'consumer',
        referrer,
        grant_type: 'password',
        metadata: {
          first_name: ' ',
          surname: ' ',
          ...formatConsentsToRegisterFields(consents),
          consents: JSON.stringify(consents),
        },
      });

      this.apiService.setToken(data.access_token, '', data.expires);

      const user = this.formatAccount(data.account);

      return {
        auth: this.formatAuth(data),
        user,
        customerConsents: this.parseJson(user?.metadata?.consents as string, []),
      };
    } catch (error: unknown) {
      if (JWPAPIService.isCommonError(error)) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to create account.');
    }
  };

  logout = async () => {
    try {
      if (InPlayer.Notifications.isSubscribed()) {
        InPlayer.Notifications.unsubscribe();
      }

      if (await this.apiService.isAuthenticated()) {
        await this.apiService.get<undefined>('/accounts/logout', { withAuthentication: true });
        await this.apiService.removeToken();
      }
    } catch {
      throw new Error('Failed to sign out.');
    }
  };

  getUser = async () => {
    try {
      const data = await this.apiService.get<AccountData>(`/accounts`, { withAuthentication: true });

      const user = this.formatAccount(data);

      return {
        user,
        customerConsents: this.parseJson(user?.metadata?.consents as string, []) as CustomerConsent[],
      };
    } catch {
      throw new Error('Failed to fetch user data.');
    }
  };

  updateCustomer: UpdateCustomer = async (customer) => {
    try {
      const data = await this.apiService.put<AccountData>('/accounts', this.formatUpdateAccount(customer), { withAuthentication: true });

      return this.formatAccount(data);
    } catch {
      throw new Error('Failed to update user data.');
    }
  };

  formatUpdateAccount = (customer: UpdateCustomerArgs) => {
    const firstName = customer.firstName?.trim() || '';
    const lastName = customer.lastName?.trim() || '';
    const fullName = `${firstName} ${lastName}`.trim() || (customer.email as string);

    const metadata: Record<string, string> = {
      ...customer.metadata,
      first_name: firstName,
      surname: lastName,
    };

    const data = {
      full_name: fullName,
      metadata,
    };

    return data;
  };

  getCaptureStatus: GetCaptureStatus = async ({ customer: { firstName, lastName } }) => {
    const firstNameTrimmed = firstName?.trim() || '';
    const lastNameTrimmed = lastName?.trim() || '';

    return {
      isCaptureEnabled: true,
      shouldCaptureBeDisplayed: !firstNameTrimmed || !lastNameTrimmed,
      settings: [
        {
          answer: {
            firstName: firstNameTrimmed || null,
            lastName: lastNameTrimmed || null,
          },
          enabled: true,
          key: 'firstNameLastName',
          required: true,
        },
      ],
    };
  };

  changePasswordWithResetToken: ChangePassword = async (payload) => {
    const { resetPasswordToken = '', newPassword, newPasswordConfirmation = '' } = payload;
    try {
      await this.apiService.put<void>(`/accounts/forgot-password/${resetPasswordToken}`, {
        password: newPassword,
        password_confirmation: newPasswordConfirmation,
        branding_id: 0,
      });
    } catch (error: unknown) {
      if (JWPAPIService.isCommonError(error)) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to change password.');
    }
  };

  getTermsConsent = ({ label: termsUrl }: RegisterField): CustomFormField => {
    const termsLink = `<a href="${termsUrl || JW_TERMS_URL}" target="_blank">${i18next.t('account:registration.terms_and_conditions')}</a>`;

    // t('account:registration.terms_consent_jwplayer')
    // t('account:registration.terms_consent')
    return {
      type: 'checkbox',
      isCustomRegisterField: true,
      required: true,
      name: 'terms',
      defaultValue: '',
      label: termsUrl
        ? i18next.t('account:registration.terms_consent', { termsLink })
        : i18next.t('account:registration.terms_consent_jwplayer', { termsLink }),
      enabledByDefault: false,
      placeholder: '',
      options: {},
      version: '1',
    };
  };

  updateWatchHistory: UpdateWatchHistory = async ({ history }) => {
    const current = await this.getWatchHistory();
    const savedHistory = current.map((e) => e.mediaid) || [];

    await Promise.allSettled(
      history.map(({ mediaid, progress }) => {
        if (!savedHistory.includes(mediaid) || current.some((e) => e.mediaid == mediaid && e.progress != progress)) {
          return this.apiService.patch<WatchHistory>(
            '/v2/accounts/media/watch-history',
            {
              media_id: mediaid,
              progress,
            },
            { withAuthentication: true },
          );
        }
      }),
    );
  };

  updateFavorites: UpdateFavorites = async ({ favorites }) => {
    const current = await this.getFavorites();
    const currentFavoriteIds = current.map((e) => e.mediaid) || [];
    const payloadFavoriteIds = favorites.map((e) => e.mediaid);

    // save new favorites
    await Promise.allSettled(
      payloadFavoriteIds.map((media_id) => {
        return !currentFavoriteIds.includes(media_id)
          ? this.apiService.post<FavoritesData>('/v2/accounts/media/favorites', { media_id }, { withAuthentication: true })
          : Promise.resolve();
      }),
    );

    // delete removed favorites
    await Promise.allSettled(
      currentFavoriteIds.map((mediaId) => {
        return !payloadFavoriteIds.includes(mediaId)
          ? this.apiService.remove<CommonResponse>(`/v2/accounts/media/favorites/${mediaId}`, { withAuthentication: true })
          : Promise.resolve();
      }),
    );
  };

  getFavorites = async () => {
    const favoritesData = await this.apiService.get<GetFavoritesResponse>('/v2/accounts/media/favorites', { withAuthentication: true });

    return favoritesData?.collection?.map(this.formatFavorite) || [];
  };

  getWatchHistory = async () => {
    const watchHistoryData = await this.apiService.get<GetWatchHistoryResponse>(
      '/v2/accounts/media/watch-history',
      {
        withAuthentication: true,
      },
      {
        filter: 'currently_watching',
      },
    );

    return watchHistoryData?.collection?.map(this.formatHistoryItem) || [];
  };

  subscribeToNotifications: NotificationsData = async ({ uuid, onMessage }) => {
    try {
      if (!InPlayer.Notifications.isSubscribed()) {
        InPlayer.subscribe(uuid, {
          onMessage: onMessage,
          onOpen: () => true,
        });
      }
      return true;
    } catch {
      return false;
    }
  };

  exportAccountData: ExportAccountData = async () => {
    // password is sent as undefined because it is now optional on BE
    try {
      return await this.apiService.post<CommonResponse>('/accounts/export', { password: undefined, branding_id: 0 }, { withAuthentication: true });
    } catch {
      throw new Error('Failed to export account data');
    }
  };

  deleteAccount: DeleteAccount = async ({ password }) => {
    try {
      return await this.apiService.remove<CommonResponse>('/accounts/erase', { withAuthentication: true }, { password, branding_id: 0 });
    } catch (error: unknown) {
      if (JWPAPIService.isCommonError(error)) {
        throw new Error(error.response.data.message || 'Failed to delete account');
      }

      throw new Error('Failed to delete account');
    }
  };

  getSocialUrls: GetSocialURLs = async ({ redirectUrl }) => {
    const socialState = this.storageService.base64Encode(
      JSON.stringify({
        client_id: this.clientId || '',
        redirect: redirectUrl,
      }),
    );

    const socialResponse = await this.apiService.get<{ status: number; data: ListSocialURLs }>(
      '/accounts/social',
      {
        includeFullResponse: true,
      },
      {
        state: socialState,
      },
    );

    if (socialResponse.status !== 200) {
      throw new Error('Failed to fetch social urls');
    }

    return socialResponse.data.social_urls;
  };
}
