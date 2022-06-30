require('ts-node/register');

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
      show: false,
      channel: 'chrome',
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
      minTimeout: 3000,
      enabled: true,
      retries: 3,
    },
    autoDelay: {
      enabled: true,
    },
    tryTo: {
      enabled: true,
    },
    screenshotOnFail: {
      enabled: true,
    },
    allure: {
      enabled: true,
    },
  },
};
