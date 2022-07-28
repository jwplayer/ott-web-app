# Environment

## Basic concepts

We use several environment variables for development and testing purposes.
To pass a variable to the application `APP_` prefix is needed.

## Vite variables

Vite adds some of variables automatically

- `MODE` - can be `development` | `test` | `production`. 
    - `development` is used when starting an application using `yarn start:*` command.
    - `test` is used for unit test when launching `yarn test` command
    - `production` is used for when we build out application (`yarn build` command)
- `DEV` - `MODE` has `development` value
- `PROD` - `MODE` has `production` value

## Custom variables

We also use custom variables in order to additional logic to the application

Read more in [configuration](/docs/configuration.md) docs;

## Vite and variable integration

Vite support automatic import of variables depending on the vite's `MODE` variable. That is why we have several `.env` files to be used for different environments. `.env` file is used for production. It is also worth mentioning that every variable can be redefined when settings with `yarn start` command, like `APP_UNSAFE_ALLOW_DYNAMIC_CONFIG=1 yarn start`