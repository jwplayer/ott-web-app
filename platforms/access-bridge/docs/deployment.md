# Deployment Instructions for `access-bridge` App

This document outlines the steps required to deploy the `access-bridge` application to Google Cloud Run. The deployment process involves checking the setup, modifying `package.json`, copying the `yarn.lock` file, deploying the application, and performing cleanup tasks.

## Prerequisites

Ensure the following before deployment:

- **Google Cloud SDK**: Install from [Google Cloud SDK Documentation](https://cloud.google.com/sdk/docs/install).
- Make sure to configure the Google Cloud project using `gcloud init`.

## Environment Configuration

Before deploying, ensure the environment variables and secrets required by the application are properly set up:

1. **Environment Variables and Secrets**:

   - Review the `.env.example` file for a list of required environment variables.
   - Set up these variables in Google Cloud Run. Secrets should be managed using [Google Cloud Secret Manager](https://cloud.google.com/security/products/secret-manager), while non-sensitive variables can be set as environment variables in the Google Cloud Run settings.

   Ensure that all sensitive information is securely managed with Secret Manager to avoid exposure of secrets in your deployment.

## Deployment Overview

The `make deploy` command automates the deployment process. It performs the following tasks:

1. **Check Setup**: Verifies that all necessary tools and configurations are in place.
2. **Backup `package.json`**: Creates a backup of the current `package.json` to restore later.
3. **Modify `package.json`**: Removes internal dependencies that may cause conflicts in Google Cloud Run.
4. **Copy `yarn.lock`**: Copies the root `yarn.lock` file to the project directory to ensure dependency consistency.
5. **Deploy**: Deploys the application to Google Cloud Run.
6. **Post-Deployment Cleanup**: Restores the original `package.json` and removes the copied `yarn.lock` file.

## Deployment Steps

Before running the deployment command, ensure the following:

1. **Clean Working Directory**: Ensure there are no uncommitted changes in your working directory. The deployment process assumes a clean state.

2. **Install Dependencies**: Run `yarn install` to ensure all dependencies are installed and up-to-date.

3. **Navigate to Project Directory**: Make sure you are in the `access-bridge` directory before running the deployment command.

4. **Configure Deployment Region**: When running the deployment command, you will be prompted to enter the region where you want to deploy the application. If you prefer not to be prompted each time, you can modify the `Makefile` to include the `--region` flag directly with your preferred region.

To deploy the `access-bridge` application, run the following command:

```sh
make deploy
```
