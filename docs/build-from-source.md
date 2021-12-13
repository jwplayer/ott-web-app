# Build JW OTT Webapp from the Source Code

In order to create a deployable version of JW OTT Webapp, follow these instructions.

## Prerequisites

The following tools are needed to start building JW OTT Webapp. Follow the instructions on the links below. 

- [GIT](https://git-scm.com/)
- [Node.js](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/)

## Clone Repository

Clone this repository on your local machine using the following commands:

```shell
$ cd ~/
$ git clone https://github.com/jwplayer/ott-web-app.git
$ cd ott-web-app
```

## Install dependencies

Dependencies are installed using Yarn. Use the following command to install all required dependencies. This may take a few minutes.

```shell
$ yarn
```

## Development server

To start a local development server, run the following command.

```shell
$ yarn start
```

> **Note:** the development server isn't optimized for production usage. Use this only for development.

## Build deployable version

To build a deployable version of the JW OTT Webapp source code, run the following command.

```shell
$ yarn build
```

This command results in a new folder in the projects root folder named `build`. This folder can be uploaded to any hosting provider.

If you haven't made any changes to the JW OTT Webapp configuration or source code, you are now ready to do so. Don't forget to run the `yarn build` command after making changes though.

