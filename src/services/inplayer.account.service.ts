import InPlayer, { AccountData, Env, GetRegisterField } from '@inplayer-org/inplayer.js';

import type {
  AuthData,
  Capture,
  Consent,
  Customer,
  CustomerConsent,
  GetCaptureStatus,
  GetCustomerConsents,
  GetCustomerConsentsResponse,
  GetPublisherConsents,
  Login,
  Register,
  UpdateCaptureAnswers,
  UpdateCustomer,
  UpdateCustomerConsents,
} from '#types/account';
import type { Config } from '#types/Config';
import type { InPlayerAuthData, InPlayerError, InPlayerResponse } from '#types/inplayer';

enum InPlayerEnv {
  Development = 'development',
  Production = 'production',
  Daily = 'daily',
}

export const setEnvironment = (config: Config) => {
  const env: string = config.integrations?.inplayer?.useSandbox ? InPlayerEnv.Daily : InPlayerEnv.Production;
  InPlayer.setConfig(env as Env);
};

export const login: Login = async ({ config, email, password }) => {
  try {
    const { data } = await InPlayer.Account.signInV2({
      email,
      password,
      clientId: config.integrations.inplayer?.clientId || '',
      referrer: window.location.href,
    });

    const user = processAccount(data.account);

    return {
      auth: processAuth(data),
      user,
      customerConsents: parseJson(user?.metadata?.consents as string),
    };
  } catch {
    throw new Error('Failed to authenticate user.');
  }
};

export const register: Register = async ({ config, email, password }) => {
  try {
    const { data } = await InPlayer.Account.signUpV2({
      email,
      password,
      passwordConfirmation: password,
      fullName: email,
      type: 'consumer',
      clientId: config.integrations.inplayer?.clientId || '',
      referrer: window.location.href,
    });

    const user = processAccount(data.account);

    return {
      auth: processAuth(data),
      user,
      customerConsents: parseJson(user?.metadata?.consents as string),
    };
  } catch (error: unknown) {
    const { response } = error as InPlayerError;
    throw new Error(response.data.message);
  }
};

export const logout = async () => {
  try {
    InPlayer.Account.signOut();
  } catch {
    throw new Error('Failed to sign out.');
  }
};

export const getUser = async () => {
  try {
    const { data } = await InPlayer.Account.getAccountInfo();

    const user = processAccount(data);
    return {
      user,
      customerConsents: parseJson(user?.metadata?.consents as string) as CustomerConsent[],
    };
  } catch {
    throw new Error('Failed to fetch user data.');
  }
};

export const getFreshJwtToken = async ({ auth }: { auth: AuthData }) => auth;

export const updateCustomer: UpdateCustomer = async (values) => {
  try {
    const firstName = values.firstName?.trim() || '';
    const lastName = values.lastName?.trim() || '';
    const fullName = `${firstName} ${lastName}`;

    const response: InPlayerResponse<AccountData> = await InPlayer.Account.updateAccount({
      fullName,
      metadata: {
        ...(values?.metadata?.consents && { consents: JSON.stringify(values.metadata?.consents) }),
        first_name: firstName,
        surname: lastName,
      },
    });

    return {
      errors: [],
      responseData: processAccount(response.data),
    };
  } catch {
    throw new Error('Failed to update user data.');
  }
};

export const getPublisherConsents: GetPublisherConsents = async (config) => {
  try {
    const { inplayer } = config.integrations;
    const { data } = await InPlayer.Account.getRegisterFields(inplayer?.clientId || '');

    // @ts-ignore
    // wrong data type from InPlayer SDK (will be updated in the SDK)
    const result: Consent[] = data?.collection
      .filter((field: GetRegisterField) => field.type === 'checkbox')
      .map((consent: GetRegisterField) => processPublisherConsents(consent));

    return {
      consents: [getTermsConsent(), ...result],
    };
  } catch {
    throw new Error('Failed to fetch publisher consents.');
  }
};

export const getCustomerConsents: GetCustomerConsents = async (payload) => {
  try {
    if (!payload?.customer) {
      return {
        consents: [],
      };
    }

    const { customer } = payload;
    const consents: GetCustomerConsentsResponse = parseJson(customer.metadata?.consents as string);

    return consents;
  } catch {
    throw new Error('Unable to fetch Customer consents.');
  }
};

export const updateCustomerConsents: UpdateCustomerConsents = async (payload) => {
  try {
    const { customer, consents } = payload;
    const data = {
      metadata: { consents },
      firstName: customer?.firstName as string,
      lastName: customer?.lastName as string,
    };
    const { responseData } = await updateCustomer(data, true, '');
    return {
      consents: parseJson(responseData?.metadata?.consents as string),
    };
  } catch {
    throw new Error('Unable to update Customer`s consents');
  }
};

export const getCaptureStatus: GetCaptureStatus = async ({ customer }) => {
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

export const updateCaptureAnswers: UpdateCaptureAnswers = async ({ ...metadata }) => {
  return (await updateCustomer(metadata, true, '')) as ServiceResponse<Capture>;
};

function processAccount(account: AccountData): Customer {
  const { id, email, full_name: fullName, metadata, created_at: createdAt } = account;
  const regDate = new Date(createdAt * 1000).toLocaleString();

  let firstName = metadata?.first_name as string;
  let lastName = metadata?.surname as string;
  if (!firstName && !lastName) {
    const nameParts = fullName.split(' ');
    firstName = nameParts[0] || '';
    lastName = nameParts.slice(1)?.join(' ');
  }
  return {
    id: id.toString(),
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

function processAuth(auth: InPlayerAuthData): AuthData {
  const { access_token: jwt } = auth;
  return {
    jwt,
    customerToken: '',
    refreshToken: '',
  };
}

function processPublisherConsents(consent: Partial<GetRegisterField>) {
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

function getTermsConsent(): Consent {
  const label = 'I accept the <a href="https://inplayer.com/legal/terms" target="_blank">Terms and Conditions</a> of InPlayer.';
  return processPublisherConsents({
    required: true,
    name: 'terms',
    label,
  });
}

function parseJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

export const canUpdateEmail = () => false;
