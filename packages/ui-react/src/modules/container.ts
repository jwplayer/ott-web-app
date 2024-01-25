import { Container } from 'inversify';

const container = new Container({ defaultScope: 'Singleton', skipBaseClassChecks: true });

export { container };
