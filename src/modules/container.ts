import { Container, interfaces } from 'inversify';

import type { IntegrationType } from '#types/Config';

export const container = new Container({ defaultScope: 'Singleton', skipBaseClassChecks: true });

export function getModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>, required: false): T | undefined;
export function getModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>, required: true): T;
export function getModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>): T;
export function getModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>, required = true): T | undefined {
  const module = container.getAll(constructorFunction)[0];

  if (required && !module) throw new Error(`Service / Controller '${String(constructorFunction)}' not found`);

  return module;
}

export function getNamedModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>, integration: IntegrationType | null, required: false): T | undefined;
export function getNamedModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>, integration: IntegrationType | null, required: true): T;
export function getNamedModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>, integration: IntegrationType | null): T;
export function getNamedModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>, integration: IntegrationType | null, required = true): T | undefined {
  if (!integration) {
    return;
  }

  let module;

  try {
    module = container.getAllNamed(constructorFunction, integration)[0];

    return module;
  } catch (err: unknown) {
    if (required) {
      throw new Error(`Service not found '${String(constructorFunction)}' with name '${integration}'`);
    }
  }
}

export function assertModuleMethod<T>(method: T, message: string): asserts method is NonNullable<T> {
  if (!method) throw new Error(message);
}

export function assertFeature(isEnabled: boolean, featureName: string): asserts isEnabled is true {
  if (!isEnabled) throw new Error(`${featureName} feature is not enabled`);
}
