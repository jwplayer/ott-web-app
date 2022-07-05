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

3. Start the local development server.

```shell
$ yarn start
```

> **NOTE:**  Only use the development server for development purposes. The development server is not optimized for production usage.

4. Build a deployable version of the JW OTT Webapp source code.<br /><br />This command creates a new folder in the projects root folder named **build**. This folder can be uploaded to any hosting provider.

```shell
$ yarn build
```

If you have not made any changes to the JW OTT Webapp configuration or source code, changes can now be made. Be sure to run the `yarn build` command after making any changes.
