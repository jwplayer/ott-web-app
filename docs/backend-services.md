# Backend dependencies and architecture

The application is built as a single page web app that can run without its own dedicated backend. This is useful for
hosting it with a very simple, static host. The server serves the static web content and the frontend
calls the [JW Player Delivery API](https://developer.jwplayer.com/jwplayer/docs) directly.
However, for additional functionality, the application can also connect to other backends to provide user
accounts / authentication, subscription management, and checkout flows.

## Roles and Functions

The available backend integrations serve 3 main roles: Accounts, Subscription, and Checkout. Below are the methods
that any backend integration needs to support broken down by role:

- [Account](src/services/account.service.ts)
  - login
  - register
  - getPublisherConsents
  - getCustomerConsents
  - resetPassword
  - changePassword
  - updateCustomer
  - updateCustomerConsents
  - getCustomer
  - refreshToken
  - getLocales
  - getCaptureStatus
  - updateCaptureAnswers
- [Subscription](src/services/subscription.service.ts)
  - getSubscriptions
  - updateSubscription
  - getPaymentDetails
  - getTransactions
- [Checkout](src/services/checkout.service.ts)
  - getOffer
  - createOrder
  - updateOrder
  - getPaymentMethods
  - paymentWithoutDetails
  - paymentWithAdyen
  - paymentWithPayPal

## Existing Configurations

### JWP

The OTT Web App is optimized to work with JWP authentication, subscriptions, and payments. For configuration options see [configuration.md](configuration.md)

### Cleeng (https://developers.cleeng.com/docs)

The Web App was also developed with support for Cleeng. Cleeng is a 3rd party platform that also provides support for the 3 functional roles above.
