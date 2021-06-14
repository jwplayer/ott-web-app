const { devices } = require('playwright');
const { setHeadlessWhen } = require('@codeceptjs/configure');

// turn on headless mode when running with HEADLESS=true environment variable
// export HEADLESS=true && npx codeceptjs run
setHeadlessWhen(process.env.HEADLESS);

exports.config = {
  grep     : '@mobile',
  tests    : './test/*_test.js',
  output   : './output',
  helpers  : {
    Playwright: {
      url    : 'http://localhost:8080',
      show   : false,
      browser: 'chromium',
      emulate: devices['iPhone SE'],
    }
  },
  include  : {
    I: './steps_file.js'
  },
  bootstrap: null,
  mocha    : {},
  name     : 'mobile',
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
