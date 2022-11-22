require('ts-node/register');
require('tsconfig-paths/register');

const { devices } = require('playwright');
const { setHeadlessWhen } = require('@codeceptjs/configure');

// turn on headless mode when running with HEADLESS=true environment variable
// export HEADLESS=true && npx codeceptjs run
setHeadlessWhen(process.env.HEADLESS);

exports.config = {
  grep: '(?=.*)^(?!.*@desktop-only)',
  tests: ['./tests/**/*.js', './tests/**/*.ts'],
  output: './output/mobile',
  timeout: 60,
  helpers: {
    Playwright: {
      url: 'http://localhost:8080',
      show: !!process.env.SHOW,
      channel: 'chrome',
      emulate: devices['Pixel 5'],
    },
  },
  include: {
    I: './utils/steps_file.ts',
  },
  bootstrap: null,
  mocha: {},
  name: 'mobile',
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
