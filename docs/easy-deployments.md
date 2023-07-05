# Easy Deployments

The instructions in this document will help you deploy your fork of the ott-web-app to some of the popular web application hosting platforms.

## Prerequisites

1. [Fork this repo](https://docs.github.com/en/get-started/quickstart/fork-a-repo).
2. Follow the instructions in [docs/build-from-source.md](build-from-source.md).

## Supported Platforms

- [Google Firebase](#google-firebase): Free, easy to use [web hosting service](https://firebase.google.com/) with [integrations](https://firebase.google.com/docs/hosting/github-integration) to deploy directly from github

### Google Firebase

#### Technical Limitations

Firebase has both [free and paid plans](https://firebase.google.com/pricing). The [limits](https://firebase.google.com/docs/hosting/usage-quotas-pricing) are determined by Google and are likely to change and evolve, but at the moment they are based on the storage and data transfer per month. Note that storage limits are calculated including preview releases and old release versions, so you may want to [limit the retention](https://firebase.google.com/docs/hosting/manage-hosting-resources#release-storage-settings) of these on your project.

#### Usage Instructions

First, in your fork, you will need to update the project ID in [.firebaserc](.firebaserc).

The easiest way to deploy is to use the [Firebase-Github integration](https://firebase.google.com/docs/hosting/github-integration). You can find the action [.yml specifications here](https://github.com/marketplace/actions/deploy-to-firebase-hosting) to deploy to a preview channel for each PR and to the live channel for each merge to your main branch. If you want to manually setup the work, you can find those instructions [here](https://github.com/FirebaseExtended/action-hosting-deploy/blob/main/docs/service-account.md).

You can also manually deploy using the Firebase CLI, as described [here](https://firebase.google.com/docs/hosting/quickstart).
