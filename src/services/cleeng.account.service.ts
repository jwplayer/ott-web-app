import jwtDecode from 'jwt-decode';
import { injectable } from 'inversify';

import AccountService from './account.service';
import CleengService from './cleeng.service';

import type { Config } from '#types/Config';
import { getOverrideIP } from '#src/utils/common';
import type {
  ChangePassword,
  GetCustomer,
  GetCustomerConsents,
  GetPublisherConsents,
  Login,
  Register,
  ResetPassword,
  UpdateCustomer,
  UpdateCustomerConsents,
  GetCaptureStatus,
  UpdateCaptureAnswers,
  AuthData,
  JwtDetails,
  GetCustomerConsentsResponse,
  GetCaptureStatusResponse,
  Capture,
  GetLocales,
  LoginPayload,
  RegisterPayload,
  UpdateCaptureAnswersPayload,
  UpdateCustomerConsentsPayload,
  UpdateCustomerPayload,
  ChangePasswordWithOldPassword,
  UpdatePersonalShelves,
  NotificationsData,
} from '#types/account';

@injectable()
export default class CleengAccountService extends AccountService {
  private readonly cleengService: CleengService;

  constructor(cleengService: CleengService) {
    super({
      canUpdateEmail: true,
      canSupportEmptyFullName: true,
      canChangePasswordWithOldPassword: false,
      canRenewSubscription: true,
      canExportAccountData: false,
      canDeleteAccount: false,
      canUpdatePaymentMethod: true,
      canShowReceipts: true,
      hasProfiles: false,
      hasSocialURLs: false,
      hasNotifications: false,
    });

    this.cleengService = cleengService;
  }

  private handleErrors = (errors: ApiResponse['errors']) => {
    if (errors.length > 0) {
      throw new Error(errors[0]);
    }
  };

  private getCustomerIdFromAuthData = (auth: AuthData) => {
    const decodedToken: JwtDetails = jwtDecode(auth.jwt);
    return decodedToken.customerId;
  };

  private getCustomer: GetCustomer = async (payload, sandbox) => {
    return this.cleengService.get(sandbox, `/customers/${payload.customerId}`, { authenticate: true });
  };

  private getLocales: GetLocales = async (sandbox) => {
    return this.cleengService.getLocales(sandbox);
  };

  initialize = async (config: Config, logoutCallback: () => Promise<void>) => {
    await this.cleengService.initialize(!!config.integrations.cleeng?.useSandbox, logoutCallback);
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
    const { config, customer } = payload;
    const { cleeng } = config.integrations;

    const response: ServiceResponse<GetCustomerConsentsResponse> = await this.cleengService.get(!!cleeng?.useSandbox, `/customers/${customer?.id}/consents`, {
      authenticate: true,
    });
    this.handleErrors(response.errors);

    return {
      consents: response?.responseData?.consents || [],
    };
  };

  updateCustomerConsents: UpdateCustomerConsents = async (payload) => {
    const { config, customer } = payload;
    const { cleeng } = config.integrations;

    const params: UpdateCustomerConsentsPayload = {
      id: customer.id,
      consents: payload.consents,
    };

    const response: ServiceResponse<never> = await this.cleengService.put(!!cleeng?.useSandbox, `/customers/${customer?.id}/consents`, JSON.stringify(params), {
      authenticate: true,
    });
    this.handleErrors(response.errors);

    return await this.getCustomerConsents(payload);
  };

  login: Login = async ({ config, email, password }) => {
    const payload: LoginPayload = {
      email,
      password,
      publisherId: config.integrations.cleeng?.id || '',
      customerIP: getOverrideIP(),
    };

    const { responseData: auth, errors }: ServiceResponse<AuthData> = await this.cleengService.post(
      !!config.integrations.cleeng?.useSandbox,
      '/auths',
      JSON.stringify(payload),
    );
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
    const localesResponse = await this.getLocales(!!config.integrations.cleeng?.useSandbox);

    this.handleErrors(localesResponse.errors);

    const payload: RegisterPayload = {
      email,
      password,
      locale: localesResponse.responseData.locale,
      country: localesResponse.responseData.country,
      currency: localesResponse.responseData.currency,
      publisherId: config.integrations.cleeng?.id || '',
      customerIP: getOverrideIP(),
    };

    const { responseData: auth, errors }: ServiceResponse<AuthData> = await this.cleengService.post(
      !!config.integrations.cleeng?.useSandbox,
      '/customers',
      JSON.stringify(payload),
    );
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
    const { responseData: user, errors } = await this.getCustomer({ customerId }, !!config.integrations.cleeng?.useSandbox);

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
    const response = await this.cleengService.get(!!cleeng?.useSandbox, `/publishers/${cleeng?.id}/consents`);

    this.handleErrors(response.errors);

    return {
      consents: response?.responseData?.consents || [],
    };
  };

  getCaptureStatus: GetCaptureStatus = async ({ customer }, sandbox) => {
    const response: ServiceResponse<GetCaptureStatusResponse> = await this.cleengService.get(sandbox, `/customers/${customer?.id}/capture/status`, {
      authenticate: true,
    });

    this.handleErrors(response.errors);

    return response;
  };

  updateCaptureAnswers: UpdateCaptureAnswers = async ({ customer, ...payload }, sandbox) => {
    const params: UpdateCaptureAnswersPayload = {
      customerId: customer.id,
      ...payload,
    };

    const response: ServiceResponse<Capture> = await this.cleengService.put(sandbox, `/customers/${customer.id}/capture`, JSON.stringify(params), {
      authenticate: true,
    });
    this.handleErrors(response.errors);

    const { responseData, errors } = await this.getCustomer({ customerId: customer.id }, sandbox);
    this.handleErrors(errors);

    return {
      errors: [],
      responseData,
    };
  };

  resetPassword: ResetPassword = async (payload, sandbox) => {
    return this.cleengService.put(sandbox, '/customers/passwords', JSON.stringify(payload));
  };

  changePasswordWithResetToken: ChangePassword = async (payload, sandbox) => {
    return this.cleengService.patch(sandbox, '/customers/passwords', JSON.stringify(payload));
  };

  changePasswordWithOldPassword: ChangePasswordWithOldPassword = async () => {
    return {
      errors: [],
      responseData: {},
    };
  };

  updateCustomer: UpdateCustomer = async (payload, sandbox) => {
    const { id, metadata, fullName, ...rest } = payload;
    const params: UpdateCustomerPayload = {
      id,
      ...rest,
    };
    // enable keepalive to ensure data is persisted when closing the browser/tab
    return this.cleengService.patch(sandbox, `/customers/${id}`, JSON.stringify(params), { authenticate: true, keepalive: true });
  };

  updatePersonalShelves: UpdatePersonalShelves = async (payload, sandbox) => {
    return await this.updateCustomer(payload, sandbox);
  };

  subscribeToNotifications: NotificationsData = async () => {
    return false;
  };

  getSocialUrls: undefined;

  exportAccountData: undefined;

  deleteAccount: undefined;
}
