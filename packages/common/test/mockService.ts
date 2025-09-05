import type { ServiceIdentifier } from 'inversify';
import { afterEach } from 'vitest';

type ServiceMockEntry = {
  serviceIdentifier: ServiceIdentifier;
  implementation: unknown;
};

export type OptionalMembers<T> = { [K in keyof T]?: T[K] };

export let mockedServices: ServiceMockEntry[] = [];

const getName = (serviceIdentifier: ServiceIdentifier) => (serviceIdentifier instanceof Function ? serviceIdentifier.name : serviceIdentifier.toString());

export const mockService = <T, B extends OptionalMembers<T>>(serviceIdentifier: ServiceIdentifier<T>, implementation: B, override = false) => {
  if (!override && mockedServices.some((mock) => mock.serviceIdentifier === serviceIdentifier)) {
    throw new Error(`There already is a mocked service for ${getName(serviceIdentifier)}`);
  }
  mockedServices = mockedServices.filter((a) => a.serviceIdentifier !== serviceIdentifier);

  mockedServices.push({
    serviceIdentifier,
    implementation,
  });

  return implementation;
};

// After importing this file, the `afterEach` and `vi.mock` are registered automatically
afterEach(() => {
  mockedServices = [];
});

vi.mock('@jwp/ott-common/src/modules/container', async () => {
  const actual = (await vi.importActual('@jwp/ott-common/src/modules/container')) as Record<string, unknown>;
  const getModule = (serviceIdentifier: ServiceIdentifier) => {
    const mockedService = mockedServices.find((current) => current.serviceIdentifier === serviceIdentifier);

    if (!mockedService) {
      throw new Error(`Couldn't find mocked service for '${getName(serviceIdentifier)}'`);
    }

    return mockedService.implementation;
  };

  const getAllModules = (serviceIdentifier: ServiceIdentifier) => {
    const mockedService = mockedServices.find((current) => current.serviceIdentifier === serviceIdentifier);

    return mockedService ? [mockedService.implementation] : [];
  };

  return {
    ...actual,
    getModule,
    getAllModules,
    getNamedModule: (serviceIdentifier: ServiceIdentifier, _name: string) => {
      return getModule(serviceIdentifier);
    },
  };
});
