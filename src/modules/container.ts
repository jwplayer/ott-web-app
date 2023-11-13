import { Container, interfaces } from 'inversify';

import type { INTEGRATION } from '#src/config';

export const container = new Container({ defaultScope: 'Singleton', skipBaseClassChecks: true });

export function getModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>, required: false): T | undefined;
export function getModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>, required: true): T;
export function getModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>): T;
export function getModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>, required = true): T | undefined {
  const module = container.getAll(constructorFunction)[0];

  if (required && !module) throw new Error(`Service '${String(constructorFunction)}' not found`);

  return module;
}

export function getNamedModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>, name: keyof typeof INTEGRATION | null, required: false): T | undefined;
export function getNamedModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>, name: keyof typeof INTEGRATION | null, required: true): T;
export function getNamedModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>, name: keyof typeof INTEGRATION | null): T;
export function getNamedModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>, name: keyof typeof INTEGRATION | null, required = true): T | undefined {
  if (!name) {
    return;
  }

  let module;

  try {
    module = container.getAllNamed(constructorFunction, name)[0];

    return module;
  } catch (err: unknown) {
    if (required) {
      throw new Error(`Service not found '${String(constructorFunction)}' with name '${name}'`);
    }
  }
}
