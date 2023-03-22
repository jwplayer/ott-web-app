require('ts-node/register');
require('tsconfig-paths/register');

const { setHeadlessWhen } = require('@codeceptjs/configure');

// turn on headless mode when running with HEADLESS=true environment variable
// export HEADLESS=true && npx codeceptjs run
setHeadlessWhen(process.env.HEADLESS);

exports.config = {
  grep: '(?=.*)^(?!.*@mobile-only)',
  tests: ['./tests/**/*.js', './tests/account_test.ts'],
  output: './output/desktop',
  timeout: 3000,
  helpers: {
    Playwright: {
      url: 'http://localhost:8080',
      show: true,
      channel: 'chrome',
      locale: 'en-US',
    },
  },
  include: {
    I: './utils/steps_file.ts',
  },
  bootstrap: null,
  mocha: {},
  name: 'desktop',
  plugins: {
    pauseOnFail: {},
    retryFailedStep: {
      minTimeout: 100,
      enabled: true,
      retries: 5,
    },
    screenshotOnFail: {
      enabled: true,
    },
    allure: {
      enabled: true,
    },
  },
};
