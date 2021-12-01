# Easy Deployments

The instructions in this document will help you deploy your fork of the ott-web-app to some of the popular web application hosting platforms.

<br />

## Prerequisites

-  [Fork this repo](https://docs.github.com/en/get-started/quickstart/fork-a-repo).
- Follow the instructions in [docs/build-from-source.md](docs/build-from-source.md).

<br />

## Supported Platforms

- [GitHub Pages](#github-pages): A free, easy-to-use [web hosting service](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages)

<br />

## Github Pages

### Technical Limitations

Github pages have some [usage limits](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages#usage-limits). In general terms, approximately **20.000 NEW** users can visit your app each month<sup>1</sup>. If more than 20.000 users visit your app each month, you should consider other paid hosting solutions.

<sup>1</sup> *Based on 100GB Github Pages bandwidth / 5MB ott-web-app build dir size and assuming perfect browser cache by all visitors.*

<br />

### Usage Instructions

1. Confirm that you can [build this project from source](./build-from-source.md). Be sure to install optional dependencies.
2. Enable the [Github Pages feature](https://docs.github.com/en/pages/getting-started-with-github-pages) for the `gh-pages` branch in your repository.
3. Run `yarn deploy:github`. Be sure to follow the instructions that appear on the screen.
4. (Optional) If you need a customization option, review `yarn deploy:github --help`.

<br />

### Technical Documentation

The `yarn deploy:github` command executes a simple nodejs script located in `scripts/deploy-github.js`. The script executes the following commands:

1. Runs `yarn build` with `SNOWPACK_PUBLIC_BASE_URL` envvar.<br/><br />That envvar is used to set the URL location of the project. By default if `SNOWPACK_PUBLIC_BASE_URL` is empty, the value will be based on the `git remote get-url origin` command. You can also pass your own `SNOWPACK_PUBLIC_BASE_URL` envvar by running `SNOWPACK_PUBLIC_BASE_URL=/my-base/ yarn deploy:github`.
2. Runs `yarn gh-pages -o origin -d build`.<br /><br />You can change the remote from *origin* to *myremote* by running `yarn deploy:github --github-remote=myremote`.  The `yarn deploy:github` command uses the GitHub remote to compute the default value for `SNOWPACK_PUBLIC_BASE_URL`.

<br />

>**TIP**: Before each of the previous steps, the script will ask if you want to continue. You can prevent these confirmation inquiries by providing `--build` or `--deploy` arguments to `yarn deploy:github`.

