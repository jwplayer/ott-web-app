# Architecture

In order to implement a more structural approach of organizing the code and to reduce coupling we decided to add Dependency Injection (DI) and Inversion of Control (IOC) patterns support for services and controllers present in the application. We expect these patterns to be even more effective when working with different OTT platforms where JS code can be reused.

## DI library

InversifyJS is used to provide IOC container and to perform DI for both services and controllers. Injection happens automatically with the help of the reflect-metadata package (by adding `injectable` decorators).

> **Important:** The type of the service / controller defined in the constructor should be used as a value, without the `type` keyword.

Won't work:

```
import type {CleengService} from './cleeng.service';

@injectable()
export default class CleengAccountService extends AccountService {
  private readonly cleengService: CleengService;

  constructor(cleengService: CleengService) {
    ...
  }
}
```

Will work:

```
import CleengService from './cleeng.service';

@injectable()
export default class CleengAccountService extends AccountService {
  private readonly cleengService: CleengService;

  constructor(cleengService: CleengService) {
    ...
  }
}
```

This is the price we need to pay to remove `inject` decorators from the constructor to avoid boilerplate code.

## Initialization

We use [register](src/modules/register.ts) function to initialize services and controllers. Some services don't depend on any integration provider (like `ConfigService` or `EpgService`), while such services as `CleengAccountService` or `InplayerAccountService` depend on the provider and get injected into controllers conditionally based on the `INTEGRATION_TYPE` dynamic value (`JWP` or `CLEENG`).

Initialization starts in the [index.tsx](src/index.tsx) file where we register services. We do it outside of the react component to make services available in different parts of the application.

The app is loaded in the [useBootstrapApp](src/hooks/useBootstrapApp.ts) hook with the help of the `AppController` which is responsible for retrieving data from the Config and Settings services, initializing the initial state of the application and hitting init methods of the base app's controllers.

## Controllers and Services

Both Controllers and Services are defined as classes. We use `injectable` decorator to make them visible for the InversifyJS library.

> **Important:** Use arrow functions for class methods to avoid lost context.

### Services

Business logic should be mostly stored in Services. We use services to communicate with the back-end and to process the data we receive.

Services also help to manage different dependencies. For example, we can use them to support several integration providers. If this is the case we should also create a common interface and make dependant entities use the interface instead of the actual implementation. This is how inversion of control principle can be respected. Then when we inject services into controllers, we use interface types instead of the implementation classes.

All in all:

- Services contain the actual business logic;
- They can be injected into controllers (which orchestrate different services) or into other services;
- We should avoid using services in the View part of the application and prefer controllers instead. However, it is still possible to do in case controllers fully duplicate service's methods (EPG service). In this case we can use a react hook (for the web app) and get access to the service there.
- One service can use provides different implementations. For example, we can split it into Cleeng and JWP implementation (account, checkout and so on).

> **Important:** Services should be written in an environment / client agnostic way (i.e. no Window usage) to be reused on different platforms (Web, SmartTV and so on).

### Controllers

Controllers bind different parts of the application. Controllers use services, store and provide methods to operate with business logic in the UI and in the App. If we need to share code across controllers then it is better to promote the code to the next level (we do it in the AppController). Then it is possible to modify both controllers to call the same (now shared) code.

- They can be called from the View part of the application;
- They use the data from the Store and from the UI to operate different injected services;
- They use the Store to persist the entities when needed;
- They return data back to the UI when needed.

> **Important:** We should try to avoid controllers calling each other because it leads to circular dependencies and makes the code messy. However now they do it sometimes (to be refactored).

### Controllers / Services retrieval

To get access to the service / controller [getModule](src/modules/container.ts) utility can be used. It also accepts a `required` param which can be used in case the presence of the service is optional. If `required` is provided but service itself is not bound then the error will be thrown.

`getNamedModule` function is mostly use in controllers to retrieve integration-specific services, like AccountService or CheckoutService.
