require('ts-node/register');

const { devices } = require('playwright');
const { setHeadlessWhen } = require('@codeceptjs/configure');

// turn on headless mode when running with HEADLESS=true environment variable
// export HEADLESS=true && npx codeceptjs run
setHeadlessWhen(process.env.HEADLESS);

exports.config = {
  grep: '(?=.*)^(?!.*@desktop-only)',
  tests: ['./tests/*.js', './tests/*.ts'],
  output: './output/mobile',
  helpers: {
    Playwright: {
      url: 'http://localhost:8080',
      show: false,
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
      enabled: true,
      retries: 2,
    },
    tryTo: {
      enabled: true,
    },
    screenshotOnFail: {
      enabled: !process.env.CI,
    },
  },
};
