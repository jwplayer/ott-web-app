# JW OTT Webapp

  

## Introduction

  

This is the main repository for the JW OTT Webapp.

  

## Development rules

  

When working on this project, keep these in mind:

  

- Use yarn.

- Run the server through `yarn start`

- Run the tests through `yarn test`

- Lint through `yarn lint`

  

## Getting started

  

- Clone this repository

-  `yarn` to install dependencies

-  `yarn start`



## How to use the create-base script

- use `yarn create-base components/YourComponentName` to create a base component
- use `yarn create-base containers/YourContainerName` to create a base container
- use `yarn create-base screens/YourScreenName` to create a base screen

  

## Git Commit Guidelines(conventional changelog)

  

We use the conventional changelog thereby defining very precise rules over how our git commit messages can be formatted. This leads to **more
readable messages** that are easy to follow when looking through the **project history**. But also, we allow us the git commit messages to **generate the change log**.

  

### Commit Message Format

Each commit message consists of a **header**, a **body** and a **footer**. The header has a special

format that includes a **type**, a **scope** and a **subject**:

  

```

<type>(<scope>): <subject>

<BLANK LINE>

<body>

<BLANK LINE>

<footer>

```

  

The subject line of the commit message cannot be longer 100 characters. This allows the message to be easier to read on GitHub as well as in various git tools.

  

### Type

  

Please use one of the following:

  

*  **feat**: A new feature

*  **fix**: A bug fix

*  **docs**: Documentation only changes

*  **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing

semi-colons, etc)

*  **refactor**: A code change that neither fixes a bug or adds a feature

*  **perf**: A code change that improves performance

*  **test**: Adding missing tests

*  **chore**: Changes to the build process or auxiliary tools and libraries such as documentation

generation

  

### Scope

  

The scope could must be specifying the location of the commit change. For example `home` or `player`. We've split up all pages and added all scopes to the allowed `./.commitlintrc.js` file.

  

The allowed scopes are:

  

- project

  

### Subject

  

The subject contains a succinct description of the change:

  

* Use the imperative, present tense: "change" not "changed" nor "changes".

* Don't capitalize the first letter.

* Do not add a dot (.) at the end.

  

### Body

  

The body should include the motivation for the change and contrast this with previous behavior.

  

### Footer

  

The footer should contain any information about **Breaking Changes** and is also the place to reference GitHub issues that this commit **Closes**.

  

## Structure

  src/
  assets/                - Static assets (image, svg, etc.)
  components/     - (Reusable) components
  containers/        - UI Containers
  config/               - Static configuration files
  providers/          - React context
  screens/             - screens

  App.tsx 
  App.scss
  index.ts          
  

### .env files

  

.env.prd - PRD config

.env.stg - STG config

.env.dev - DEV config

.env.local - Local config

[Read more.](https://www.snowpack.dev/reference/environment-variables)

  

## Language, Frameworks, Sdk's and Libraries

  

### Typescript

  

Typescript is superset of javascript, TypeScript adds optional types to JavaScript that support tools for large-scale JavaScript applications for any browser, for any host, on any OS. TypeScript compiles to readable, standards-based JavaScript.

  

- Optional static typing

- Spot bugs at compile time

- Predictability

- Readability

- Fast refactoring

- Power of OOP

  

[Read more.](https://www.typescriptlang.org/)

  

### React

  

React uses Virtual DOM. The virtual DOM is a programming concept where an ideal, or “virtual”, representation of a UI is kept in memory.

The Virtual DOM compares the components’ previous states and updates only the items in the Real DOM that were changed, instead of updating all of the components again.

  

- Easy creation of dynamic applications

- Great performance

- Reusable components

- Unidirectional data flow

- Dedicated tools for easy debugging

  

[Read more.](https://reactjs.org/docs/getting-started.html)

  
  

### Snowpack

  

Snowpack is a frontend build tool. Snowpack leverages JavaScript's native module system (known as ESM) to avoid unnecessary work.

  

- Instant startup

- Build once, cache forever

- HMR feat. Fast Refresh

- Easy configuration

  

[Read more.](https://www.snowpack.dev/tutorials/quick-start)

  



  

### React query

  

Fetch, cache and update data in React applications without touching any "global state".

  

- Declarative & Automatic

- Simple & Familiar

- Powerful & Configurable

  

[Read more.](https://react-query.tanstack.com/)

  

### React Router

  

React Router is a collection of navigational components that compose declaratively with the application.

  

- Viewing declarations in a standardized structure helps us to instantly understand what are our app views

- Lazy code loading

- Using the React router, a developer can easily handle the nested views and the progressive resolution of views

- Using the browsing history feature, the user can navigate backwards/forwards and restore the state of the view

- Dynamic route matching

  

[Read more.](https://reactrouter.com/web/guides/quick-start)

  

### Jest

  

Jest is a JavaScript test runner, that is, a JavaScript library for creating, running, and structuring tests. It allows the developer to write tests that are easy to read and maintain.

  

- Fast in excution

- Simple mock functions

- Manual module mocks

- Snapshot testing

- Built-in coverage reports

  

[Read more.](https://jestjs.io/docs/getting-started)

  

### Sass

  

Sass is CSS extension language. Wich enables a developer to write cleaner, moduler CSS en theirby easier to maintain CSS.

  

- Uses nested syntax

- Includes mixins

- Adds import abilities

  

[Read more.](https://sass-lang.com/guide)

  
  

### CodeceptJS

  

CodeceptJS is a modern end to end testing framework that is designed to make tests easy to read, write, and develop. Test are writen in javascript with a special BDD-style syntax. The tests are written as a linear scenario of the user's action on in a app.

  

- Scenario Driven

- Driver Agnostic

- Interactive Debug

- Rich Locators

- Web & Mobile Testing

- Parallel Testing

- Multi-Session Testing

  

[Read more.](https://codecept.io/basics/)

  
  

### Cleeng (MediaStore SDK)

  

Cleeng is a subscription retention platform that provides a seamlessly integration for identity, entitlement, billing, and analytics functionality.

  

- ChurnIQ 2.0 Analytics

- Identity management

- Checkout implementation

  
  

[Read more.](https://developers.cleeng.com/docs/getting-started-with-cleeng)