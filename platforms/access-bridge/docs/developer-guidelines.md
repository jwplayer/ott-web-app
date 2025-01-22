# Developer guidelines

## When working on this project, keep these in mind:

- Use `yarn` to install dependencies
- Run tests through `yarn test`
- Start the project using `yarn start`

## Project Structure

```
/build*                 - Directory where the code is compiled by `yarn build`
/docs                   - Documentation related to the project
/node_modules*          - Yarn generated dependencies
/src                    - Source code for the application
  /controllers          - Controller modules containing the core logic for handling requests and responses
  /services             - Services which connect external data sources to the application
  /pipeline             - Middleware and routing logic
    /middleware.ts      - Middleware functions and error handling
    /routes.ts          - Route definitions and route registration
    /logger.ts          - Logger class that integrates with Sentry if defined with fallback as a development logger
  /errors.ts            - Custom error classes and error handling logic
  /http.ts              - HTTP utility functions and setup
  /app-config.ts        - Configuration settings for the application
  /main.ts              - Main entry point of the application
  /server.ts            - Server initialization and configuration
/test                   - Data and scripts for testing
/.env<.mode>            - Environment variables for different modes (e.g., development, production)
/package.json           - Yarn file for dependencies and scripts




* = Generated directories, not in source control

Note: Some system and util files are not shown above for brevity.
You probably won't need to mess with anything not shown here.
```

## Sentry Setup and Configuration

### Integrating Sentry

Sentry is integrated into this project to track and monitor errors, as well as performance issues. To ensure that Sentry is properly configured and working as expected, follow the steps below:

- Environment Variables:  
  Ensure that your .env.<mode> files include the following Sentry-related environment variables:  
  APP_SENTRY_DSN=Your_Sentry_DSN  
  APP_SENTRY_AUTH_TOKEN=Your_Sentry_Auth_Token  
  APP_SENTRY_TRACE_RATE=Trace rate for performance monitoring  
  APP_SENTRY_ORG_NAME=Your_Sentry_ORG_Name  
  APP_SENTRY_PROJ_NAME=Your_Sentry_Project_Name  
  <em>These variables are essential for Sentry to function correctly and should be kept secure.</em>

- Running the Project:  
  Use the following commands to install dependencies, run tests, and start the project, with Sentry automatically configured:
  Install dependencies: yarn  
  Run tests: yarn test  
  Start the project: yarn start

- Source Maps:  
  Source maps are configured to be generated during the build process to allow Sentry to provide readable stack traces.
  When building the project, the source maps will be automatically uploaded to Sentry if the correct environment variables are set.

- Error Monitoring:  
  Sentry captures unhandled errors and sends detailed reports, including stack traces, to help in debugging.
  Review the Sentry dashboard regularly to monitor the health of the application.

- Performance Monitoring:  
  Sentry is also configured for performance monitoring. Ensure that the trace rate is appropriately set in the environment variables.

## Adding Sentry to New Features

When adding new features or making significant changes to the code:

- Error Handling:  
  Ensure that errors are properly captured and logged using Sentry.
- Custom Error Classes:  
  If you define custom error classes, integrate them with Sentry for better tracking.
- Performance Considerations:  
  For critical paths, consider adding custom performance monitoring using Sentry’s APIs.
