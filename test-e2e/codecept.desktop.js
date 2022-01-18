require('ts-node/register');

const { setHeadlessWhen } = require('@codeceptjs/configure');

// turn on headless mode when running with HEADLESS=true environment variable
// export HEADLESS=true && npx codeceptjs run
setHeadlessWhen(process.env.HEADLESS);

exports.config = {
  grep: '@desktop',
  tests    : [
    './tests/*.js',
    './tests/*.ts'
  ],
  output   : './output',
  helpers  : {
    Playwright: {
      url    : 'http://localhost:8080',
      show   : false,
      browser: 'chromium',
    }
  },
  include  : {
    I: './utils/steps_file.js'
  },
  bootstrap: null,
  mocha    : {},
  name     : 'desktop',
  plugins  : {
    pauseOnFail     : {},
    retryFailedStep : {
      enabled: true,
      retries: 2,
    },
    tryTo           : {
      enabled: true
    },
    screenshotOnFail: {
      enabled: !process.env.CI
    }
  }
};
