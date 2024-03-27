import jwtDecode from 'jwt-decode';
import { inject, injectable } from 'inversify';

import type { AccessModel, Config } from '../../../../types/config';
import type {
  AuthData,
  ChangePassword,
  ChangePasswordWithOldPassword,
  GetCaptureStatus,
  GetCaptureStatusResponse,
  GetCustomerConsents,
  GetPublisherConsents,
  JwtDetails,
  Login,
  LoginPayload,
  NotificationsData,
  Register,
  RegisterPayload,
  ResetPassword,
  UpdateCaptureAnswers,
  UpdateCaptureAnswersPayload,
  UpdateCustomer,
  UpdateCustomerConsents,
  UpdateCustomerConsentsPayload,
  UpdateCustomerPayload,
  UpdateFavorites,
  UpdateWatchHistory,
} from '../../../../types/account';
import AccountService from '../AccountService';
import { GET_CUSTOMER_IP } from '../../../modules/types';
import type { GetCustomerIP } from '../../../../types/get-customer-ip';
import { ACCESS_MODEL } from '../../../constants';
import type { ServiceResponse } from '../../../../types/service';
import type { SerializedWatchHistoryItem } from '../../../../types/watchHistory';
import type { SerializedFavorite } from '../../../../types/favorite';

import CleengService from './CleengService';
import type {
  GetCustomerResponse,
  GetCustomerConsentsResponse,
  GetPublisherConsentsResponse,
  UpdateConsentsResponse,
  UpdateCustomerResponse,
  AuthResponse,
} from './types/account';
import { formatCustomer } from './formatters/customer';
import { formatPublisherConsent } from './formatters/consents';
import type { Response } from './types/api';

@injectable()
export default class CleengAccountService extends AccountService {
  private readonly cleengService;
  private readonly getCustomerIP;
  private publisherId = '';

  private externalData: Record<string, unknown> = {};

  accessModel: AccessModel = ACCESS_MODEL.AUTHVOD;
  svodOfferIds: string[] = [];
  sandbox = false;

  constructor(cleengService: CleengService, @inject(GET_CUSTOMER_IP) getCustomerIP: GetCustomerIP) {
    super({
      canUpdateEmail: true,
      canSupportEmptyFullName: true,
      canChangePasswordWithOldPassword: false,
      canRenewSubscription: true,
      canExportAccountData: false,
      canDeleteAccount: false,
      canUpdatePaymentMethod: true,
      canShowReceipts: false,
      hasSocialURLs: false,
      hasNotifications: false,
      // The 'externalData' attribute of Cleeng can contain max 4000 characters
      watchListSizeLimit: 48,
    });

    this.cleengService = cleengService;
    this.getCustomerIP = getCustomerIP;
  }

  private handleErrors = (errors: string[]) => {
    if (errors.length > 0) {
      throw new Error(errors[0]);
    }
  };

  private getCustomerIdFromAuthData = (auth: AuthData) => {
    const decodedToken: JwtDetails = jwtDecode(auth.jwt);
    return decodedToken.customerId;
  };

  private getCustomer = async ({ customerId }: { customerId: string }) => {
    const { responseData, errors } = await this.cleengService.get<GetCustomerResponse>(`/customers/${customerId}`, {
      authenticate: true,
    });

    this.handleErrors(errors);
    this.externalData = responseData.externalData || {};

    return formatCustomer(responseData);
  };

  private getLocales = async () => {
    return this.cleengService.getLocales();
  };

  initialize = async (config: Config, _url: string, logoutCallback: () => Promise<void>) => {
    const cleengConfig = config?.integrations?.cleeng;

    if (!cleengConfig?.id) {
      throw new Error('Failed to initialize Cleeng integration. The publisherId is missing.');
    }

    // set accessModel and publisherId
    this.publisherId = cleengConfig.id;
    this.accessModel = cleengConfig.monthlyOffer || cleengConfig.yearlyOffer ? ACCESS_MODEL.SVOD : ACCESS_MODEL.AUTHVOD;
    this.svodOfferIds = [cleengConfig?.monthlyOffer, cleengConfig?.yearlyOffer].filter(Boolean).map(String);

    // initialize the Cleeng service
    this.sandbox = !!cleengConfig.useSandbox;
    await this.cleengService.initialize(this.sandbox, logoutCallback);
  };

  getAuthData = async () => {
    if (this.cleengService.tokens) {
      return {
        jwt: this.cleengService.tokens.accessToken,
        refreshToken: this.cleengService.tokens.refreshToken,
      } as AuthData;
    }

    return null;
  };

  getCustomerConsents: GetCustomerConsents = async (payload) => {
    const { customer } = payload;
    const response = await this.cleengService.get<GetCustomerConsentsResponse>(`/customers/${customer?.id}/consents`, {
      authenticate: true,
    });
    this.handleErrors(response.errors);

    return response?.responseData?.consents || [];
  };

  updateCustomerConsents: UpdateCustomerConsents = async (payload) => {
    const { customer } = payload;

    const params: UpdateCustomerConsentsPayload = {
      id: customer.id,
      consents: payload.consents,
    };

    const response = await this.cleengService.put<UpdateConsentsResponse>(`/customers/${customer?.id}/consents`, JSON.stringify(params), {
      authenticate: true,
    });
    this.handleErrors(response.errors);

    return await this.getCustomerConsents(payload);
  };

  login: Login = async ({ email, password }) => {
    const payload: LoginPayload = {
      email,
      password,
      publisherId: this.publisherId,
      customerIP: await this.getCustomerIP(),
    };

    const { responseData: auth, errors } = await this.cleengService.post<AuthResponse>('/auths', JSON.stringify(payload));
    this.handleErrors(errors);

    await this.cleengService.setTokens({ accessToken: auth.jwt, refreshToken: auth.refreshToken });

    const { user, customerConsents } = await this.getUser();

    return {
      user,
      auth,
      customerConsents,
    };
  };

  register: Register = async ({ email, password, consents }) => {
    const localesResponse = await this.getLocales();

    this.handleErrors(localesResponse.errors);

    const payload: RegisterPayload = {
      email,
      password,
      locale: localesResponse.responseData.locale,
      country: localesResponse.responseData.country,
      currency: localesResponse.responseData.currency,
      publisherId: this.publisherId,
      customerIP: await this.getCustomerIP(),
    };

    const { responseData: auth, errors }: ServiceResponse<AuthData> = await this.cleengService.post('/customers', JSON.stringify(payload));
    this.handleErrors(errors);

    await this.cleengService.setTokens({ accessToken: auth.jwt, refreshToken: auth.refreshToken });

    const { user } = await this.getUser();

    const customerConsents = await this.updateCustomerConsents({ consents, customer: user }).catch(() => {
      // error caught while updating the consents, but continue the registration process
      return [];
    });

    return {
      user,
      auth,
      customerConsents,
    };
  };

  logout = async () => {
    // clear the persisted access tokens
    await this.cleengService.clearTokens();
  };

  getUser = async () => {
    const authData = await this.getAuthData();

    if (!authData) throw new Error('Not logged in');

    const customerId = this.getCustomerIdFromAuthData(authData);
    const user = await this.getCustomer({ customerId });
    const consents = await this.getCustomerConsents({ customer: user });

    return {
      user,
      customerConsents: consents,
    };
  };

  getPublisherConsents: GetPublisherConsents = async () => {
    const response = await this.cleengService.get<GetPublisherConsentsResponse>(`/publishers/${this.publisherId}/consents`);

    this.handleErrors(response.errors);

    return (response.responseData?.consents || []).map(formatPublisherConsent);
  };

  getCaptureStatus: GetCaptureStatus = async ({ customer }) => {
    const response: ServiceResponse<GetCaptureStatusResponse> = await this.cleengService.get(`/customers/${customer?.id}/capture/status`, {
      authenticate: true,
    });

    this.handleErrors(response.errors);

    return response.responseData;
  };

  updateCaptureAnswers: UpdateCaptureAnswers = async ({ customer, ...payload }) => {
    const params: UpdateCaptureAnswersPayload = {
      customerId: customer.id,
      ...payload,
    };

    const response = await this.cleengService.put<UpdateConsentsResponse>(`/customers/${customer.id}/capture`, JSON.stringify(params), {
      authenticate: true,
    });
    this.handleErrors(response.errors);

    return this.getCustomer({ customerId: customer.id });
  };

  resetPassword: ResetPassword = async (payload) => {
    const response = await this.cleengService.put<Response<unknown>>(
      '/customers/passwords',
      JSON.stringify({
        ...payload,
        publisherId: this.publisherId,
      }),
    );

    this.handleErrors(response.errors);
  };

  changePasswordWithResetToken: ChangePassword = async (payload) => {
    const response = await this.cleengService.patch<Response<unknown>>(
      '/customers/passwords',
      JSON.stringify({
        ...payload,
        publisherId: this.publisherId,
      }),
    );

    this.handleErrors(response.errors);
  };

  changePasswordWithOldPassword: ChangePasswordWithOldPassword = async () => {
    // Cleeng doesn't support this feature
  };

  updateCustomer: UpdateCustomer = async (payload) => {
    const { id, metadata, fullName, ...rest } = payload;
    const params: UpdateCustomerPayload = {
      id,
      ...rest,
    };

    // enable keepalive to ensure data is persisted when closing the browser/tab
    const { responseData, errors } = await this.cleengService.patch<UpdateCustomerResponse>(`/customers/${id}`, JSON.stringify(params), {
      authenticate: true,
      keepalive: true,
    });

    this.handleErrors(errors);
    this.externalData = responseData.externalData || {};

    return formatCustomer(responseData);
  };

  updateWatchHistory: UpdateWatchHistory = async ({ user, history }) => {
    const payload = { id: user.id, externalData: { ...this.externalData, history } };
    const { errors, responseData } = await this.cleengService.patch<UpdateCustomerResponse>(`/customers/${user.id}`, JSON.stringify(payload), {
      authenticate: true,
      keepalive: true,
    });

    this.handleErrors(errors);
    this.externalData = responseData.externalData || {};
  };

  updateFavorites: UpdateFavorites = async ({ user, favorites }) => {
    const payload = { id: user.id, externalData: { ...this.externalData, favorites } };
    const { errors, responseData } = await this.cleengService.patch<UpdateCustomerResponse>(`/customers/${user.id}`, JSON.stringify(payload), {
      authenticate: true,
      keepalive: true,
    });

    this.handleErrors(errors);
    this.externalData = responseData.externalData || {};
  };

  getWatchHistory = async () => {
    return (this.externalData['history'] || []) as SerializedWatchHistoryItem[];
  };

  getFavorites = async () => {
    return (this.externalData['favorites'] || []) as SerializedFavorite[];
  };

  subscribeToNotifications: NotificationsData = async () => {
    return false;
  };

  getSocialUrls: undefined;

  exportAccountData: undefined;

  deleteAccount: undefined;
}
