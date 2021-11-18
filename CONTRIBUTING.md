# Contributing to JW OTT Webapp

If you want to contribute a fix or feature to the JW OTT Webapp repository, please read and follow the guidelines below.

## Development rules

When working on this project, keep these in mind:

- Use yarn.
- Run the server through `yarn start`
- Run the tests through `yarn test`
- Run the e2e tests through `yarn codecept:mobile` and `yarn codecept:desktop`
- Format the code through `yarn format`
- Lint through `yarn lint`
- Lint and fix through `yarn lint --fix`

## Getting started

- Clone this repository
- Run `yarn` to install dependencies
- Run `yarn start`

## How to use the create-base script

The `yarn create-base` can be used to quickly scaffold a component, container or screen.  

- use `yarn create-base components/YourComponentName` to create a base component
- use `yarn create-base containers/YourContainerName` to create a base container
- use `yarn create-base screens/YourScreenName` to create a base screen

## Git Commit Guidelines (conventional changelog)

We use the conventional changelog thereby defining very precise rules over how our git commit messages can be formatted. This leads to **more readable messages** that are easy to follow when looking through the **project history**. But also, we allow the git commit messages to **generate the change log**.

### Commit Message Format

Each commit message consists of a **header**, a **body** and a **footer**. The header has a special format that includes a **type**, a **scope** and a **subject**:

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
*  **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
*  **refactor**: A code change that neither fixes a bug or adds a feature
*  **perf**: A code change that improves performance
*  **test**: Adding missing tests
*  **chore**: Changes to the build process or auxiliary tools and libraries such as documentation generation

### Scope

The scope must specify the location of the commit change. For example `home` or `search`.

The allowed scopes are:

- project
- home
- playlist
- videodetail
- player
- series
- search
- user
- watchhistory
- favorites
- analytics
- pwa
- seo
- auth
- menu
- payment

### Subject

The subject contains a succinct description of the change:

* Use the imperative, present tense: "change" not "changed" nor "changes".
* Don't capitalize the first letter.
* Do not add a dot (.) at the end.

### Body

The body should include the motivation for the change and contrast this with previous behavior.

### Footer

The footer should contain any information about **Breaking Changes** and is also the place to reference GitHub issues that this commit **Closes**.

## Project Structure

```
/src
  /assets         - Static assets (image, svg, etc.)
  /components     - (Reusable) components
  /containers     - UI Containers
  /hooks          - Custom React hooks
  /icons          - SVG icons wrapped in React Components
  /providers      - React context
  /screens        - Screens (essentially containers, but only used directly in the router)
  /services       - Services which connects external data sources to the application
  /stores         - Pullstate store files
  /styles         - Global SCSS rules, theming and variables
  /utils          - Utility functions

  /App.tsx        - The main React component which renders the app
  /index.ts       - The entrypoint
```
