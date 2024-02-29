import { Container, injectable, type interfaces, inject } from 'inversify';

import { logDev } from '../utils/common';

export const container = new Container({ defaultScope: 'Singleton', skipBaseClassChecks: true });

export { injectable, inject };

export function getModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>, required: false): T | undefined;
export function getModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>, required: true): T;
export function getModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>): T;
export function getModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>, required = true): T | undefined {
  const module = container.getAll(constructorFunction)[0];

  if (required && !module) throw new Error(`Service / Controller '${String(constructorFunction)}' not found`);

  return module;
}

export function getNamedModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>, name: string | null, required: false): T | undefined;
export function getNamedModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>, name: string | null, required: true): T;
export function getNamedModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>, name: string | null): T;
export function getNamedModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>, name: string | null, required = true): T | undefined {
  if (!name) {
    return;
  }

  let module;

  try {
    module = container.getAllNamed(constructorFunction, name)[0];

    return module;
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('No matching bindings found')) {
      if (required) {
        throw new Error(`Service not found '${String(constructorFunction)}' with name '${name}'`);
      }

      return;
    }

    logDev('Error caught while initializing service', err);
  }
}

export function assertModuleMethod<T>(method: T, message: string): asserts method is NonNullable<T> {
  if (!method) throw new Error(message);
}

export function assertFeature(isEnabled: boolean, featureName: string): asserts isEnabled is true {
  if (!isEnabled) throw new Error(`${featureName} feature is not enabled`);
}
