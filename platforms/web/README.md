# OTT Web App

## Getting started

- Clone this repository
- Run `yarn` to install dependencies
- Navigate to the platform directory `cd platforms/web`
- Run unit tests through `yarn test`
- Format the code through `yarn format` (or automatically do it via git hooks)
- Lint through `yarn lint` (eslint, prettier, stylelint and tsc checks)
- Run `yarn start`

## Create favicons / pwa icons

First override the source icon with another image here [./public/images/icons/app-icon.png`](./public/images/icons/app-icon.png)
Use a high-quality square-sized image.
We suggest a dimension 1024x1024 or higher

- Navigate to the platform directory `cd platforms/web`
- Perform `yarn generate-pwa-assets`

Install `sharp` if you get the following error: Could not load the "sharp" module using the ... runtime and run `yarn generate-pwa-assets` afterward

The different icon formats are defined here [pwa-assets.config.ts](./pwa-assets.config.ts)

## Developer guidelines

- Read the workspace guidelines here [../../docs/developer-guidelines.md](../../docs/developer-guidelines.md).
- Read the web platform guidelines here [./docs/developer-guidelines.md](./docs/developer-guidelines.md).
