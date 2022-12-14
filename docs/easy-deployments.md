# Easy Deployments

The instructions in this document will help you deploy your fork of the ott-web-app to some of the popular web application hosting platforms.

## Prerequisites

1. [Fork this repo](https://docs.github.com/en/get-started/quickstart/fork-a-repo).
2. Follow the instructions in [docs/build-from-source.md](build-from-source.md).

## Supported Platforms

- [Google Firebase](#google-firebase): Free, easy to use [web hosting service](https://firebase.google.com/) with [integrations](https://firebase.google.com/docs/hosting/github-integration) to deploy directly from github.
- [GitHub Pages](#github-pages): Static hosting [directly from a repository](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages) though with some limitations

### Google Firebase

#### Technical Limitations

Firebase has both [free and paid plans](https://firebase.google.com/pricing). The [limits](https://firebase.google.com/docs/hosting/usage-quotas-pricing) are determined by Google and are likely to change and evolve, but at the moment they are based on the storage and data transfer per month.  Note that storage limits are calculated including preview releases and old release versions, so you may want to [limit the retention](https://firebase.google.com/docs/hosting/manage-hosting-resources#release-storage-settings) of these on your project. 

#### Usage Instructions

First, in your fork, you will need to update the project ID in [.firebaserc](.firebaserc).

The easiest way to deploy is to use the [Firebase-Github integration](https://firebase.google.com/docs/hosting/github-integration). You can find the action [.yml specifications here](https://github.com/marketplace/actions/deploy-to-firebase-hosting) to deploy to a preview channel for each PR and to the live channel for each merge to your main branch.  If you want to manually setup the work, you can find those instructions [here](https://github.com/FirebaseExtended/action-hosting-deploy/blob/main/docs/service-account.md).

You can also manually deploy using the Firebase CLI, as described [here](https://firebase.google.com/docs/hosting/quickstart).

### Github Pages

#### Technical Limitations

Github pages is bare bones static hosting, not optimized for single page apps. This means that urls do not automatically redirect to index.html.  For this reason, the Github deploy scripts configure the application to use [hash routing](https://v5.reactrouter.com/web/api/HashRouter), which may be undesirable for production applications. 

Github pages also has some [usage limits](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages#usage-limits).  These limits are determined by Github and are likely to change and evolve, but at the moment they are primarily on the repo size, the bandwidth, and the number of builds per hour. After reviewing the current Github pages limits, if you anticipate exceeding these, you should consider other paid hosting solutions.

#### Usage Instructions

1. (Optional) If you need a customization option, review `yarn deploy:github --help`.
2. Confirm that you can [build this project from source](./build-from-source.md). Be sure to install optional dependencies.
3. Enable the [Github Pages feature](https://docs.github.com/en/pages/getting-started-with-github-pages) for the `gh-pages` branch in your repository.
4. Run `yarn deploy:github`. Be sure to follow the instructions that appear on the screen. If you want to connect your github deployment to a custom domain remember to add `--custom-domain=mydomain.com`

### Technical Documentation

The `yarn deploy:github` command executes a simple nodejs script located in `scripts/deploy-github.js`. The script executes the following commands:

1. Runs `yarn build` with `APP_GITHUB_PUBLIC_BASE_URL` envvar.<br/><br />That envvar is used to set the URL location of the project. By default if `APP_GITHUB_PUBLIC_BASE_URL` is empty, the value will be based on the `git remote get-url origin` command. You can also pass your own `APP_GITHUB_PUBLIC_BASE_URL` envvar by running `APP_GITHUB_PUBLIC_BASE_URL=/my-base/ yarn deploy:github`.
2. Runs `yarn gh-pages -o origin -d build`.<br /><br />You can change the remote from *origin* to *myremote* by running `yarn deploy:github --github-remote=myremote`.  The `yarn deploy:github` command uses the GitHub remote to compute the default value for `APP_GITHUB_PUBLIC_BASE_URL`.


>**TIP**: Before each of the previous steps, the script will ask if you want to continue. You can prevent these confirmation inquiries by providing `--build` or `--deploy` arguments to `yarn deploy:github`.

