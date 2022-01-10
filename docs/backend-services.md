# Backend dependencies and architecture

The application is built as a single page web app that can run without its own dedicated backend. This is useful for
hosting it with a very simple, static host, like github pages. The server serves the static web content and the frontend
calls the [JW Player Delivery API](https://developer.jwplayer.com/jwplayer/docs) directly.
However, for additional functionality, the application can also connect to other backends to provide user
accounts / authentication, subscription management, and checkout flows. 


## Roles and Functions

The available backend integrations serve 3 main roles, Accounts, Subscription, and Checkout. Below are the methods
that any backend integration needs to support broken down by role:

- [Account](../src/services/account.service.ts)
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
- [Subscription](../src/services/subscription.service.ts)
  - getSubscriptions
  - updateSubscription
  - getPaymentDetails
  - getTransactions
- [Checkout](../src/services/checkout.service.ts)
  - getOffer
  - createOrder
  - updateOrder
  - getPaymentMethods
  - paymentWithoutDetails
  - paymentWithAdyen
  - paymentWithPayPal

## Existing Configurations

### Cleeng (https://developers.cleeng.com/docs)

The OTT Web App was initially built around Cleeng, and Cleeng is an all-in-one platform that provides support for all of the 3 functional roles above. For configuration options see [configuration.md](configuration.md)

