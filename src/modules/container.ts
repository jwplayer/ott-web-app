import { Container, interfaces } from 'inversify';

export const container = new Container({ defaultScope: 'Singleton', skipBaseClassChecks: true });

export function getModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>, required: false): T | undefined;
export function getModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>, required: true): T;
export function getModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>): T;
export function getModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>, required = true): T | undefined {
  const module = container.getAll(constructorFunction)[0];

  if (required && !module) throw new Error(`Service '${String(constructorFunction)}' not found`);

  return module;
}

export function getNamedModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>, name: string, required: false): T | undefined;
export function getNamedModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>, name: string, required: true): T;
export function getNamedModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>, name: string): T;
export function getNamedModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>, name: string, required = true): T | undefined {
  const module = container.getAllNamed(constructorFunction, name)[0];

  if (required && !module) throw new Error(`Service not found '${String(constructorFunction)}' with name '${name}'`);

  return module;
}
