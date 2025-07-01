import { Container } from 'inversify';

const container = new Container({ defaultScope: 'Singleton', autobind: true });

export { container };
