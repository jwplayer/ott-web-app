require('ts-node/register');
require('tsconfig-paths/register');

const { setHeadlessWhen } = require('@codeceptjs/configure');

// turn on headless mode when running with HEADLESS=true environment variable
// export HEADLESS=true && npx codeceptjs run
setHeadlessWhen(process.env.HEADLESS);

exports.config = {
  grep: '(?=.*)^(?!.*@mobile-only)',
  tests: ['./tests/**/*.js', './tests/**/*.ts'],
  output: './output/desktop',
  timeout: 60,
  helpers: {
    Playwright: {
      url: 'http://localhost:8080',
      show: !!process.env.SHOW,
      channel: 'chrome',
      locale: 'en-US',
      keepCookies: false,
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
      minTimeout: 1000,
      enabled: true,
      retries: 5,
    },
    screenshotOnFail: {
      enabled: true,
    },
    allure: {
      enabled: true,
      require: '@codeceptjs/allure-legacy',
    },
  },
};
