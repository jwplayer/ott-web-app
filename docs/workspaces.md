# Workspaces

## Why workspaces?

The JW OTT Web App is an open-source repository that showcases an OTT app implementing JWP services. The OTT Web App, as
the name implies, originates as a web-only repository. But much of the source-code can be re-used for many different
platforms, such as CapacitorJS, React Native, LightningJS and other frameworks based on TypeScript.

Using the previous codebase, it would be quite challenging to re-use the services because of the dependencies and
browser usage. For example, the AccountController could redirect a user to a different page by using `window.location`.
This will never work in a non-browser environment and will crash the app.

This means that we need to:

- Make some of the shareable code platform-agnostic
- Make some of the shareable code framework-agnostic
- Make importing services, controllers, stores, and utils possible in any other projects/platforms
- Benefit from linting based on the environment (Node, Browser, Vite, ...)

## The solution

Based on the re-usability of the existing codebase, we've created separate modules using Yarn Workspaces.
This will combine all similar code and prevent installing redundant or conflicting dependencies.

For example, all components, containers, and pages are combined into the `packages/ui-react` module, which depends on
React and React DOM. 
To create a React Native app, you could add a `packages/ui-react-native` module and configure
aliases to use the correct module.

## Packages & Platforms

A split has been made between the platform and reusable code. All reusable code is further split into multiple packages.
This is mostly done to separate the React from the non-react code.

Here is a breakdown of each module:

### Common

Name: `@jwp/ott-common`

The common module contains all non-react TypeScript code, reusable between multiple frameworks. These are controllers,
services, stores, utilities and typings. There should be no platform-specific dependencies like React or React DOM.

Typings can also be reused for multiple frameworks.

TypeScript is configured to prevent browser typings. You don't have access to Browser globals like `localStorage` or
`location`.

**Example usage:**

```ts
import { configureEnv } from '@jwp/ott-common/src/env';

configureEnv({
  APP_VERSION: 'v1.0.0',
});
```

### React Hooks

Name: `@jwp/ott-hooks-react`

Hooks are special because they are React-dependent but can be shared between the React and React Native frameworks.
That’s why they are in a separate folder for usage from both the two frameworks.

### i18n (TODO)

Name: `@jwp/ott-i18n`

We’re using i18next, which is also a framework-independent library. We can re-use the configuration and translation
files between all platforms.

### Testing

Name: `@jwp/ott-testing`

This module can contain all test fixtures and perhaps some generic test utils. But it shouldn’t contain
CodeceptJS/Playwright-specific code.

### Theme (TODO)

Name: `@jwp/ott-theme`

The most important theming comes from the app config, but many other SCSS variables can be abstracted into generic 
(JSON) tokens. 
These tokens can be used across multiple frameworks.

Raw SVG icons are added here as well.

The theme folder also contains generic assets like images, logos, and fonts.

### UI-react

Name: `@jwp/ott-ui-react`

The ui-react package contains all the existing React UI code.
The ui-react package also contains the SCSS variables and theme for usage across multiple platforms.

### Platforms/web

Name: `@jwp/ott-web`

The web folder is located in the platforms directory in the project's root folder. A platform is the entry point for
platform-specific code. In the case of the web platform, this is all the Vite.js configuration and App.tsx for
bootstrapping the app.

We can add more platforms by adding a folder to the `../platforms` folder.

Each platform is a standalone application that may use other modules defined in the packages folder as dependencies.

### ESLint, PostCSS and Stylelint

Besides the mentioned packages, there are also three utility packages listed in the configs folder.
These utility packages exist to align linting dependencies and configurations between the different packages and apps.

All packages depend on Eslint and need a configuration. The recommended way of doing this in a monorepo is by creating
a local package.

**eslint-config-jwp**

This is the Eslint config for React or TypeScript packages. Usage:

**.eslintrc.js**

```js
module.exports = {
  extends: ['jwp/typescript'], // extends: ['jwp/react'],
};
```

**postcss-config-jwp**

This package contains the PostCSS config. It's not much, but it will ensure the config stays the same for all packages.

**postcss.config.js**

```js
module.exports = require('postcss-config-jwp');
```

**stylelint-config-jwp**

This package contains all Stylelint rules.

**stylelint.config.js**

```js
module.exports = {
  extends: ['stylelint-config-jwp'],
};
```
