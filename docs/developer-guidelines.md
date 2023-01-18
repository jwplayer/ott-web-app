## When working on this project, keep these in mind:

- Use yarn.
- Run the server through `yarn start`
- Run the tests through `yarn test`
- Run the e2e tests through `yarn codecept:mobile` and `yarn codecept:desktop`
- Format the code through `yarn format` (or automatically do it via git hooks)
- Lint through `yarn lint` (eslint, prettier, stylelint and tsc checks)
- The JW organization requires personal access tokens for all of their repositories. In order to create a branch or pull request you'll need to [Generate a Personal Access Token](https://github.com/settings/tokens) and then [store it in your git config](https://stackoverflow.com/questions/46645843/where-to-store-my-git-personal-access-token/67360592). (For token permissions, `repo` should be sufficient.) 

## Versioning and Changelog

We use the [TriPSs/conventional-changelog-action](https://github.com/TriPSs/conventional-changelog-action) github [action](https://github.com/jwplayer/ott-web-app/actions/workflows/bump-version.yml) to do an automated version increment for any commit to the develop branch.  The type of version increment will be determined by the commit message(s) in the code being added as follows (see [Convential Commits](https://www.conventionalcommits.org/en/v1.0.0/) for more details):
* `fix:` - perform a patch bump
* `feat:` - perform a minor bump
* `chore:` - no version change
* commit body contains `BREAKING CHANGE:` - perform a major bump
* `<type>!:` (i.e. `feat!:`) - perform a major bump

In case there are multiple commits being merged, the biggest type of bump will be performed.

The github action will update the project package.json, create a release tag in github, and update the changelog based on the commit messages in the code being merged.

**Note**: In order to access the repository and bypass the protected branch requirements, the action relies on a personal access token, which must belong to an admin of the repo, and which is stored as `ACTION_TOKEN` in the [repository secrets](https://github.com/jwplayer/ott-web-app/settings/secrets/actions). If this token needs to be updated, please generate a [Personal Access Token](https://github.com/settings/tokens) with the `public_repo` scope.

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
- e2e

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
/.github          - Templates and action workflows for Github
/.husky           - Husky scripts for running checks on git triggers
/build*           - Directory where the code is compiled by `yarn build`
/coverage*        - Location of the C8 coverage report
/docs             - Documentation
  /_images        - Images used in the docs and README
  /features       - Docs coverage specific product use cases
/ini              - Directory to group different initialization files
  /templates      - Template .ini files per mode
/node_modules*    - Yarn generated dependencies
/public           - Static files to be hosted with the application
/scripts          - Dev helper scripts for i18n, deployment, etc.
/src              - Source code for the application
  /assets         - Static assets (image, svg, etc.)
  /components     - Reusable, side-effect free UI components
  /containers     - UI Containers
  /hooks          - Custom React hooks
  /i18n           - Internationalization tools
    /locales      - Languages specific folders with translation json files
  /icons          - SVG icons wrapped in React Components
  /pages          - Main application layout containers per route
    /ScreenRouting- Mappings from media_type to layout container for medias
  /services       - Services which connects external data sources to the application
  /stores         - Zustand stores and controllers
  /styles         - Global SCSS rules, theming and variables
  /utils          - Utility functions
  /App.tsx        - The main React component which renders the app
  /index.tsx      - The entrypoint
  /registerSer... - Script or SPA functionality
/test             - Data and scrips for unit and e2e testing
/test-e2e         - End to end tests and scripts
/types            - Global type definitions
/.env<.mode>      - Environment variables for different Vite modes
/CHANGELOG.md     - Auto-generated changelog
/firebase.json    - Config for firebase static hosting
/index.html       - Main html file entrypoint for the application
/package.json     - Yarn file for dependencies and scripts
/vite.config.ts   - Vite build and test configuration file

* = Generated directories, not in source control

Note: Some system and util files are not shown above for brevity.
You probably won't need to mess with anything not shown here.
```
