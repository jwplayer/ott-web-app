import { Container } from 'inversify';

const iocContainer = new Container({ defaultScope: 'Singleton' });

const useController = <T extends object>(type: symbol): T => {
  return iocContainer.get<T>(type);
};

export { iocContainer, useController };
