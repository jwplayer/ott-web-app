import InPlayer, { AccountData, Env, GetRegisterField } from '@inplayer-org/inplayer.js';

import type {
  AuthData,
  Capture,
  Consent,
  Customer,
  CustomerConsent,
  GetCaptureStatus,
  GetCaptureStatusResponse,
  GetCustomerConsentsPayload,
  GetPublisherConsents,
  Login,
  Register,
  UpdateCaptureAnswers,
  UpdateCustomer,
  UpdateCustomerConsents,
} from '#types/account';
import type { Config } from '#types/Config';
import type { InPlayerAuthData, InPlayerError } from '#types/inplayer';

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

    return {
      auth: processAuth(data),
      user: processAccount(data.account),
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
      fullName: 'New User',
      type: 'consumer',
      clientId: config.integrations.inplayer?.clientId || '',
      referrer: window.location.href,
    });

    return {
      auth: processAuth(data),
      user: processAccount(data.account),
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

export const getUser = async (): Promise<Customer> => {
  try {
    const { data } = await InPlayer.Account.getAccountInfo();
    return processAccount(data);
  } catch {
    throw new Error('Failed to fetch user data.');
  }
};

export const getFreshJwtToken = async ({ auth }: { auth: AuthData }) => auth;

export const updateCustomer: UpdateCustomer = async (values) => {
  try {
    const fullName = `${values.firstName} ${values.lastName}`;
    const consents = processCustomerConsents(values?.consents || []);

    const response = await InPlayer.Account.updateAccount({
      fullName,
      metadata: {
        firstName: values.firstName as string,
        lastName: values.lastName as string,
        ...consents,
      },
    });

    return {
      errors: [],
      // @ts-ignore
      // wrong data type from InPlayer SDK (will be updated in the SDK)
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
    const result: Array<Consent> = data?.collection
      .filter((field: GetRegisterField) => field.type === 'checkbox')
      .map((consent: GetRegisterField) => processPublisherConsents(consent));

    return {
      errors: [],
      responseData: {
        consents: [getTermsConsent(), ...result],
      },
    };
  } catch {
    throw new Error('Failed to fetch publisher consents.');
  }
};

export const getCustomerConsents = async (payload: GetCustomerConsentsPayload) => {
  try {
    const { customer } = payload;

    if (!customer?.metadata) {
      return {
        errors: [],
        responseData: {
          consents: [],
        },
      };
    }

    const consents = Object.keys(customer.metadata)
      .filter((key) => key.includes('consents_'))
      .map((key) => JSON.parse(customer.metadata?.[key] as string));

    return {
      errors: [],
      responseData: {
        consents,
      },
    };
  } catch {
    throw new Error('Unable to fetch Customer consents.');
  }
};

export const updateCustomerConsents: UpdateCustomerConsents = async (payload) => {
  try {
    const { customer, consents } = payload;

    const data = {
      consents,
      firstName: customer.metadata?.firstName as string,
      lastName: customer.metadata?.lastName as string,
    };

    return (await updateCustomer(data, true, '')) as ServiceResponse<never>;
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
  } as ServiceResponse<GetCaptureStatusResponse>;
};

export const updateCaptureAnswers: UpdateCaptureAnswers = async ({ ...metadata }) => {
  return (await updateCustomer(metadata, true, '')) as ServiceResponse<Capture>;
};

function processAccount(account: AccountData): Customer {
  const { id, email, full_name: fullName, metadata, created_at: createdAt } = account;
  const regDate = new Date(createdAt * 1000).toLocaleString();

  return {
    id: id.toString(),
    email,
    fullName,
    metadata,
    firstName: metadata?.firstName as string,
    lastName: metadata?.lastName as string,
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

function processCustomerConsents(consents: CustomerConsent[]) {
  const result: { [key: string]: string } = {};
  consents?.forEach((consent: CustomerConsent) => {
    if (consent.name) {
      const { name, version, state } = consent;
      result[`consents_${consent.name}`] = JSON.stringify({ name, version, state });
    }
  });
  return result;
}

function getTermsConsent(): Consent {
  const label = 'I accept the <a href="https://inplayer.com/legal/terms" target="_blank">Terms and Conditions</a> of InPlayer.';
  return processPublisherConsents({
    required: true,
    name: 'terms',
    label,
  });
}
