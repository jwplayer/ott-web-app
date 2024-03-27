# Developer guidelines

## When working on this project, keep these in mind:

- Use `yarn`
- Run unit tests through `yarn test`
- Format the code through `yarn format` (or automatically do it via git hooks)
- Lint through `yarn lint` (eslint, prettier, stylelint and tsc checks)
- Run `yarn i18next` from the workspace root to extract all translations keys from source-code
- Run `yarn depcheck` from the workspace root to validating dependency usages for all packages
- Run `npx syncpack lint` from the workspace root for validating dependency issues for all workspaces

## Project Structure

```
/build*                 - Directory where the code is compiled by `yarn build`
/coverage*              - Location of the C8 coverage report
/docs                   - Documentation
/ini                    - Directory to group different initialization files
  /templates            - Template .ini files per mode
/node_modules*          - Yarn generated dependencies
/public                 - Static files to be hosted with the application
/scripts                - Dev helper scripts for deployment, etc.
/src                    - Source code for the application
  /components           - Reusable, side-effect free UI components
  /containers           - UI Containers
  /hooks                - Custom React hooks
  /i18n                 - Internationalization tools
  /modules              - Container registry for IoC
  /services             - Services which connects external data sources to the application
  /styles               - Global SCSS rules, theming and variables
  /utils                - Utility functions
  /App.tsx              - The main React component which renders the app
  /constants.ts         - Re-usable TypeScript constants 
  /index.tsx            - The entrypoint
  /screenMapping.tsx    - The screen mapping registers custom screens for contentTypes
/test                   - Data and scripts for unit and e2e testing
/test-cases             - Test cases written in cucumber format
/test-e2e               - End to end tests and scripts
/types                  - Global type definitions
/.env<.mode>            - Environment variables for different Vite modes
/firebase.json          - Config for firebase static hosting
/index.html             - Main html file entrypoint for the application
/package.json           - Yarn file for dependencies and scripts
/vite.config.ts         - Vite build and test configuration file

* = Generated directories, not in source control

Note: Some system and util files are not shown above for brevity.
You probably won't need to mess with anything not shown here.
```
