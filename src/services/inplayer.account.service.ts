import InPlayer, { AccountData, Env, RegisterField, UpdateAccountData, FavoritesData, WatchHistory } from '@inplayer-org/inplayer.js';
import i18next from 'i18next';
import { injectable } from 'inversify';

import AccountService from './account.service';

import type {
  AuthData,
  Capture,
  ChangePassword,
  ChangePasswordWithOldPassword,
  Consent,
  Customer,
  CustomerConsent,
  DeleteAccount,
  ExportAccountData,
  ExternalData,
  GetCaptureStatus,
  GetCustomer,
  GetCustomerConsents,
  GetCustomerConsentsResponse,
  GetLocales,
  GetPublisherConsents,
  Login,
  NotificationsData,
  Register,
  ResetPassword,
  SocialURLSData,
  UpdateCaptureAnswers,
  UpdateCustomer,
  UpdateCustomerArgs,
  UpdateCustomerConsents,
  UpdatePersonalShelves,
} from '#types/account';
import type { Config } from '#types/Config';
import type { InPlayerAuthData, InPlayerError } from '#types/inplayer';
import type { Favorite } from '#types/favorite';
import type { WatchHistoryItem } from '#types/watchHistory';
import { getCommonResponseData } from '#src/utils/api';

enum InPlayerEnv {
  Development = 'development',
  Production = 'production',
  Daily = 'daily',
}

@injectable()
export default class InplayerAccountService extends AccountService {
  constructor() {
    super({
      canUpdateEmail: false,
      canSupportEmptyFullName: false,
      canChangePasswordWithOldPassword: true,
      canRenewSubscription: false,
      canExportAccountData: true,
      canUpdatePaymentMethod: false,
      canShowReceipts: false,
      canDeleteAccount: true,
      canManageProfiles: true,
      hasNotifications: true,
    });
  }

  private getCustomerExternalData = async (): Promise<ExternalData> => {
    const [favoritesData, historyData] = await Promise.all([InPlayer.Account.getFavorites(), await InPlayer.Account.getWatchHistory({})]);

    const favorites = favoritesData.data?.collection?.map((favorite: FavoritesData) => {
      return this.formatFavorite(favorite);
    });

    const history = historyData.data?.collection?.map((history: WatchHistory) => {
      return this.formatHistoryItem(history);
    });

    return {
      favorites,
      history,
    };
  };

  private getTermsConsent(): Consent {
    const termsUrl = '<a href="https://inplayer.com/legal/terms" target="_blank">Terms and Conditions</a>';

    return this.formatPublisherConsents({
      required: true,
      name: 'terms',
      label: i18next.t('account:registration.terms_consent', { termsUrl }),
    });
  }

  private parseJson(value: string, fallback = {}) {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  private formatFavorite = (favorite: FavoritesData): Favorite => {
    return {
      mediaid: favorite.media_id,
    } as Favorite;
  };

  private formatHistoryItem = (history: WatchHistory): WatchHistoryItem => {
    return {
      mediaid: history.media_id,
      progress: history.progress,
    } as WatchHistoryItem;
  };

  private formatAccount(account: AccountData): Customer {
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
  }

  private formatUpdateAccount(customer: UpdateCustomerArgs) {
    const firstName = customer.firstName?.trim() || '';
    const lastName = customer.lastName?.trim() || '';
    const fullName = `${firstName} ${lastName}`.trim() || (customer.email as string);
    const metadata: { [key: string]: string } = {
      first_name: firstName,
      surname: lastName,
      ...customer.metadata,
    };

    const data: UpdateAccountData = {
      fullName,
      metadata,
    };

    return data;
  }

  private formatAuth(auth: InPlayerAuthData): AuthData {
    const { access_token: jwt } = auth;
    return {
      jwt,
      refreshToken: '',
    };
  }

  private formatPublisherConsents(consent: Partial<RegisterField>) {
    return {
      broadcasterId: 0,
      enabledByDefault: false,
      label: consent.label,
      name: consent.name,
      required: consent.required,
      value: '',
      version: '1',
    } as Consent;
  }

  initialize = async (config: Config, _logoutFn: () => Promise<void>) => {
    const env: string = config.integrations?.jwp?.useSandbox ? InPlayerEnv.Development : InPlayerEnv.Production;
    InPlayer.setConfig(env as Env);
    const queryParams = new URLSearchParams(window.location.href.split('#')[1]);
    const token = queryParams.get('token');
    const refreshToken = queryParams.get('refresh_token');
    const expires = queryParams.get('expires');
    if (!token || !refreshToken || !expires) {
      return;
    }
    InPlayer.Account.setToken(token, refreshToken, parseInt(expires));
  };

  getAuthData = async () => {
    if (InPlayer.Account.isAuthenticated()) {
      const credentials = InPlayer.Account.getToken().toObject();

      return {
        jwt: credentials.token,
        refreshToken: credentials.refreshToken,
      } as AuthData;
    }

    return null;
  };

  login: Login = async ({ config, email, password }) => {
    try {
      const { data } = await InPlayer.Account.signInV2({
        email,
        password,
        clientId: config.integrations.jwp?.clientId || '',
        referrer: window.location.href,
      });

      const user = this.formatAccount(data.account);
      user.externalData = await this.getCustomerExternalData();

      return {
        auth: this.formatAuth(data),
        user,
        customerConsents: this.parseJson(user?.metadata?.consents as string, []),
      };
    } catch {
      throw new Error('Failed to authenticate user.');
    }
  };

  register: Register = async ({ config, email, password }) => {
    try {
      const { data } = await InPlayer.Account.signUpV2({
        email,
        password,
        passwordConfirmation: password,
        fullName: email,
        metadata: {
          first_name: ' ',
          surname: ' ',
        },
        type: 'consumer',
        clientId: config.integrations.jwp?.clientId || '',
        referrer: window.location.href,
      });

      const user = this.formatAccount(data.account);
      user.externalData = await this.getCustomerExternalData();

      return {
        auth: this.formatAuth(data),
        user,
        customerConsents: this.parseJson(user?.metadata?.consents as string, []),
      };
    } catch (error: unknown) {
      const { response } = error as InPlayerError;
      throw new Error(response.data.message);
    }
  };

  logout = async () => {
    try {
      InPlayer.Notifications.unsubscribe();
      await InPlayer.Account.signOut();
    } catch {
      throw new Error('Failed to sign out.');
    }
  };

  getUser = async () => {
    try {
      const { data } = await InPlayer.Account.getAccountInfo();

      const user = this.formatAccount(data);
      user.externalData = await this.getCustomerExternalData();

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
      const response = await InPlayer.Account.updateAccount(this.formatUpdateAccount(customer));

      return {
        errors: [],
        responseData: this.formatAccount(response.data),
      };
    } catch {
      throw new Error('Failed to update user data.');
    }
  };

  getPublisherConsents: GetPublisherConsents = async (config) => {
    try {
      const { jwp } = config.integrations;
      const { data } = await InPlayer.Account.getRegisterFields(jwp?.clientId || '');

      const result: Consent[] = data?.collection.filter((field) => field.type === 'checkbox').map((consent) => this.formatPublisherConsents(consent));

      return {
        consents: [this.getTermsConsent(), ...result],
      };
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
      const consents: GetCustomerConsentsResponse = this.parseJson(customer.metadata?.consents as string, []);

      return consents;
    } catch {
      throw new Error('Unable to fetch Customer consents.');
    }
  };

  updateCustomerConsents: UpdateCustomerConsents = async (payload) => {
    try {
      const { customer, consents } = payload;
      const params = { ...this.formatUpdateAccount(customer), ...{ metadata: { consents: JSON.stringify(consents) } } };

      const { data } = await InPlayer.Account.updateAccount(params);

      return {
        consents: this.parseJson(data?.metadata?.consents as string, []),
      };
    } catch {
      throw new Error('Unable to update Customer consents');
    }
  };

  getCaptureStatus: GetCaptureStatus = async ({ customer }) => {
    return {
      errors: [],
      responseData: {
        isCaptureEnabled: true,
        shouldCaptureBeDisplayed: true,
        settings: [
          {
            answer: {
              firstName: customer.firstName || null,
              lastName: customer.lastName || null,
            },
            enabled: true,
            key: 'firstNameLastName',
            required: true,
          },
        ],
      },
    };
  };

  updateCaptureAnswers: UpdateCaptureAnswers = async ({ ...metadata }) => {
    return (await this.updateCustomer(metadata, true)) as ServiceResponse<Capture>;
  };

  changePasswordWithOldPassword: ChangePasswordWithOldPassword = async (payload) => {
    const { oldPassword, newPassword, newPasswordConfirmation } = payload;
    try {
      await InPlayer.Account.changePassword({
        oldPassword,
        password: newPassword,
        passwordConfirmation: newPasswordConfirmation,
      });
      return {
        errors: [],
        responseData: {},
      };
    } catch {
      throw new Error('Failed to change password.');
    }
  };

  changePasswordWithResetToken: ChangePassword = async (payload) => {
    const { resetPasswordToken = '', newPassword, newPasswordConfirmation = '' } = payload;
    try {
      await InPlayer.Account.setNewPassword(
        {
          password: newPassword,
          passwordConfirmation: newPasswordConfirmation,
          brandingId: 0,
        },
        resetPasswordToken,
      );
      return {
        errors: [],
        responseData: {},
      };
    } catch {
      throw new Error('Failed to change password.');
    }
  };

  resetPassword: ResetPassword = async ({ customerEmail, publisherId }) => {
    try {
      await InPlayer.Account.requestNewPassword({
        email: customerEmail,
        merchantUuid: publisherId || '',
        brandingId: 0,
      });
      return {
        errors: [],
        responseData: {},
      };
    } catch {
      throw new Error('Failed to reset password.');
    }
  };

  updatePersonalShelves: UpdatePersonalShelves = async (payload) => {
    const { favorites, history } = payload.externalData;
    const externalData = await this.getCustomerExternalData();
    const currentFavoriteIds = externalData?.favorites?.map((e) => e.mediaid);
    const payloadFavoriteIds = favorites?.map((e) => e.mediaid);
    const currentWatchHistoryIds = externalData?.history?.map((e) => e.mediaid);

    try {
      history?.forEach(async (history) => {
        if (
          !currentWatchHistoryIds?.includes(history.mediaid) ||
          externalData?.history?.some((e) => e.mediaid == history.mediaid && e.progress != history.progress)
        ) {
          await InPlayer.Account.updateWatchHistory(history.mediaid, history.progress);
        }
      });

      if (payloadFavoriteIds && payloadFavoriteIds.length > (currentFavoriteIds?.length || 0)) {
        payloadFavoriteIds.forEach(async (mediaId) => {
          if (!currentFavoriteIds?.includes(mediaId)) {
            await InPlayer.Account.addToFavorites(mediaId);
          }
        });
      } else {
        currentFavoriteIds?.forEach(async (mediaid) => {
          if (!payloadFavoriteIds?.includes(mediaid)) {
            await InPlayer.Account.deleteFromFavorites(mediaid);
          }
        });
      }

      return {
        errors: [],
        responseData: {},
      };
    } catch {
      throw new Error('Failed to update external data');
    }
  };

  subscribeToNotifications: NotificationsData = async ({ uuid = '', onMessage }) => {
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
      const response = await InPlayer.Account.exportData({ password: undefined, brandingId: 0 });
      return getCommonResponseData(response);
    } catch {
      throw new Error('Failed to export account data');
    }
  };

  deleteAccount: DeleteAccount = async ({ password }) => {
    try {
      const response = await InPlayer.Account.deleteAccount({ password, brandingId: 0 });
      return getCommonResponseData(response);
    } catch {
      throw new Error('Failed to delete account');
    }
  };

  getSocialUrls: SocialURLSData = async (config: Config) => {
    const socialState = window.btoa(
      JSON.stringify({
        client_id: config.integrations.jwp?.clientId || '',
        redirect: window.location.href.split('u=')[0],
      }),
    );

    const socialResponse = await InPlayer.Account.getSocialLoginUrls(socialState);

    if (socialResponse.status !== 200) {
      throw new Error('Failed to fetch social urls');
    }

    return socialResponse.data.social_urls;
  };

  getLocales: GetLocales = () => {
    throw new Error('Method is not supported');
  };

  getCustomer: GetCustomer = () => {
    throw new Error('Method is not supported');
  };
}
