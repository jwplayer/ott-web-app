# Build JW OTT Webapp from the Source Code

In order to create a deployable version of JW OTT Webapp, follow these instructions in this document.

## Prerequisites

The following tools are needed to start building JW OTT Webapp. Follow the instructions on the links below:

- [GIT](https://git-scm.com/)
- [Node.js](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/)

## Build the JW OTT Webapp

1. Clone the **ott-web-app** repository on your local machine.

```shell
$ cd ~/

$ git clone https://github.com/jwplayer/ott-web-app.git
$ cd ott-web-app
```

2. Install the required dependencies. Optional dependencies include packages that are not necessary to build the project. These optional dependencies can be safely ignored.

```shell
$ yarn --ignore-optional
```

> **NOTE**: Some of the [easy deployments](easy-deployments.md) instructions require installing these optional dependencies. Use the `yarn` command to install all dependencies. The `yarn` command can be run even if  `yarn --ignore-optional` has been previously run.

3. Create or update the .ini files in `/ini` for the modes you will be running in (probably dev and prod.)
    You can copy the ini file from `/ini/templates` into `/ini`.  The files in `/ini` are git-ignored, so you do not need to worry about account values in source control, but you will need to recreate the ini files each time you make a fresh checkout of the repository.

    The .ini files provide startup values to the application such as which app config to load by default.  See [initialization-file](initialization-file.md) for more details.


4. Start the local development server.

```shell
$ yarn start
```

If you encounter any errors, make sure you have correctly set the `defaultConfigSource` in `/ini/.webapp.dev.ini` to point to a valid app config from your JWP account. 
> **NOTE:**  Only use the development server for development purposes. The development server is not optimized for production usage.

5. Build a deployable version of the JW OTT Webapp source code.<br /><br />This command creates a new folder in the projects root folder named **build**.
    The `public` folder from the build directory can be uploaded to any static hosting provider to run the web app from that host.

```shell
$ yarn build
```

If you have not made any changes to the JW OTT Webapp configuration or source code, changes can now be made. Be sure to run the `yarn build` command after making any changes.

If you encounter any errors, first check to make sure you've properly updated `/ini/.webapp.prod.ini` to point `defaultConfigSource` to your production app config from your JWP account.

## Modes

We make use of [Vite's 'mode' concept](https://vitejs.dev/guide/env-and-mode.html#modes) to cleanly separate different deployments.
For most cases, you will want to use `dev`, `test`, or `prod` modes.  The supported modes are described below.

Please keep in mind that there is a nuanced difference between vite `mode` and whether you are running a development or production build as determined by [`NODE_ENV`](https://nodejs.dev/en/learn/nodejs-the-difference-between-development-and-production/).
Mode can be whatever different deployment environments that our application can be run in, while the build type will always be either `development` or `production`.
Typically when you run the development server using `yarn start`, it will be a `development` build and you build the code with `yarn build` and then host it from static hosting, you will be running a production build.

Production builds optimize code and minimize debug information, while development builds are made for developers to dig into.

* **dev** - used for developers to locally develop, test, and debug code. Has the most debug information, including a config selector to help developers quickly switch between app configs. Will allow any app config to be loaded.
* **test** - used when running unit and e2e tests. Should typically be run as a production build. Will only load a select list of test app configs
* **prod** - default used when running `yarn build` to create compiled code for production hosting. You should make sure to update the prod .ini file to only allow app configs from your account.
* **demo** - used for the [JWP preview site](https://app-preview.jwplayer.com/) and includes a dialog to switch between app configs. Will allow any app-config to be loaded and does not have a default config.
* **preview** - used for github PR previews. Behaves like a hybrid between dev and demo.
* **jwdev** - this mode is for running code on JW's internal dev environment. It will only work for JW employees on the internal network.
