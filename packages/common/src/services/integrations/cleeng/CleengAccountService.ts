import jwtDecode from 'jwt-decode';
import { inject, injectable } from 'inversify';

import type { AccessModel, Config } from '../../../../types/config';
import type {
  AuthData,
  Capture,
  ChangePassword,
  ChangePasswordWithOldPassword,
  GetCaptureStatus,
  GetCaptureStatusResponse,
  GetCustomer,
  GetCustomerConsents,
  GetCustomerConsentsResponse,
  GetLocales,
  GetPublisherConsents,
  GetPublisherConsentsResponse,
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
  UpdatePersonalShelves,
} from '../../../../types/account';
import AccountService from '../AccountService';
import { GET_CUSTOMER_IP } from '../../../modules/types';
import type { GetCustomerIP } from '../../../../types/get-customer-ip';
import { ACCESS_MODEL } from '../../../constants';
import type { ServiceResponse } from '../../../../types/service';

import CleengService from './CleengService';

@injectable()
export default class CleengAccountService extends AccountService {
  private readonly cleengService;
  private readonly getCustomerIP;
  private publisherId = '';

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
      canShowReceipts: true,
      hasSocialURLs: false,
      hasNotifications: false,
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

  private getCustomer: GetCustomer = async (payload) => {
    return this.cleengService.get(`/customers/${payload.customerId}`, { authenticate: true });
  };

  private getLocales: GetLocales = async () => {
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
    const response: ServiceResponse<GetCustomerConsentsResponse> = await this.cleengService.get(`/customers/${customer?.id}/consents`, {
      authenticate: true,
    });
    this.handleErrors(response.errors);

    return {
      consents: response?.responseData?.consents || [],
    };
  };

  updateCustomerConsents: UpdateCustomerConsents = async (payload) => {
    const { customer } = payload;

    const params: UpdateCustomerConsentsPayload = {
      id: customer.id,
      consents: payload.consents,
    };

    const response: ServiceResponse<never> = await this.cleengService.put(`/customers/${customer?.id}/consents`, JSON.stringify(params), {
      authenticate: true,
    });
    this.handleErrors(response.errors);

    return await this.getCustomerConsents(payload);
  };

  login: Login = async ({ config, email, password }) => {
    const payload: LoginPayload = {
      email,
      password,
      publisherId: this.publisherId,
      customerIP: await this.getCustomerIP(),
    };

    const { responseData: auth, errors }: ServiceResponse<AuthData> = await this.cleengService.post('/auths', JSON.stringify(payload));
    this.handleErrors(errors);

    await this.cleengService.setTokens({ accessToken: auth.jwt, refreshToken: auth.refreshToken });

    const { user, customerConsents } = await this.getUser({ config });

    return {
      user,
      auth,
      customerConsents,
    };
  };

  register: Register = async ({ config, email, password, consents }) => {
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

    const { user, customerConsents } = await this.getUser({ config });

    await this.updateCustomerConsents({ config, consents, customer: user }).catch(() => {
      // error caught while updating the consents, but continue the registration process
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

  getUser = async ({ config }: { config: Config }) => {
    const authData = await this.getAuthData();

    if (!authData) throw new Error('Not logged in');

    const customerId = this.getCustomerIdFromAuthData(authData);
    const { responseData: user, errors } = await this.getCustomer({ customerId });

    this.handleErrors(errors);

    const consentsPayload = {
      config,
      customer: user,
    };

    const { consents } = await this.getCustomerConsents(consentsPayload);

    return {
      user,
      customerConsents: consents,
    };
  };

  getPublisherConsents: GetPublisherConsents = async (config) => {
    const { cleeng } = config.integrations;
    const response: ServiceResponse<GetPublisherConsentsResponse> = await this.cleengService.get(`/publishers/${cleeng?.id}/consents`);

    this.handleErrors(response.errors);

    return {
      consents: response?.responseData?.consents || [],
    };
  };

  getCaptureStatus: GetCaptureStatus = async ({ customer }) => {
    const response: ServiceResponse<GetCaptureStatusResponse> = await this.cleengService.get(`/customers/${customer?.id}/capture/status`, {
      authenticate: true,
    });

    this.handleErrors(response.errors);

    return response;
  };

  updateCaptureAnswers: UpdateCaptureAnswers = async ({ customer, ...payload }) => {
    const params: UpdateCaptureAnswersPayload = {
      customerId: customer.id,
      ...payload,
    };

    const response: ServiceResponse<Capture> = await this.cleengService.put(`/customers/${customer.id}/capture`, JSON.stringify(params), {
      authenticate: true,
    });
    this.handleErrors(response.errors);

    const { responseData, errors } = await this.getCustomer({ customerId: customer.id });
    this.handleErrors(errors);

    return {
      errors: [],
      responseData,
    };
  };

  resetPassword: ResetPassword = async (payload) => {
    return this.cleengService.put(
      '/customers/passwords',
      JSON.stringify({
        ...payload,
        publisherId: this.publisherId,
      }),
    );
  };

  changePasswordWithResetToken: ChangePassword = async (payload) => {
    return this.cleengService.patch(
      '/customers/passwords',
      JSON.stringify({
        ...payload,
        publisherId: this.publisherId,
      }),
    );
  };

  changePasswordWithOldPassword: ChangePasswordWithOldPassword = async () => {
    return {
      errors: [],
      responseData: {},
    };
  };

  updateCustomer: UpdateCustomer = async (payload) => {
    const { id, metadata, fullName, ...rest } = payload;
    const params: UpdateCustomerPayload = {
      id,
      ...rest,
    };
    // enable keepalive to ensure data is persisted when closing the browser/tab
    return this.cleengService.patch(`/customers/${id}`, JSON.stringify(params), {
      authenticate: true,
      keepalive: true,
    });
  };

  updatePersonalShelves: UpdatePersonalShelves = async (payload) => {
    return await this.updateCustomer(payload);
  };

  subscribeToNotifications: NotificationsData = async () => {
    return false;
  };

  getSocialUrls: undefined;

  exportAccountData: undefined;

  deleteAccount: undefined;
}
