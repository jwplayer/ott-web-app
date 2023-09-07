import { Container, interfaces } from 'inversify';

export const container = new Container({ defaultScope: 'Singleton', skipBaseClassChecks: true });

export const getModule = <T>(type: interfaces.Newable<T>): T => {
  const all = container.getAll(type);

  // This app expects 0 or 1 instances of each type and no more
  if (all.length > 1) {
    throw new Error(`Type not unique for ${type}`);
  }

  return all.length === 1 ? all[0] : container.resolve(type);
};
