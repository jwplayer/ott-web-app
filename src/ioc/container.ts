import { Container } from 'inversify';
import getDecorators from 'inversify-inject-decorators';

const iocContainer = new Container({ defaultScope: 'Singleton' });

const { lazyInject } = getDecorators(iocContainer, true);

const useController = <T extends object>(type: symbol): T => {
  return iocContainer.get<T>(type);
};

export { iocContainer, lazyInject, useController };
