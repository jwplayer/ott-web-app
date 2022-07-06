# e2e tests

## Instruments used

We use several libraries for e2e-tests:

- CodeceptJS as a test launcher
- Playwright as a cross-browser e2e engine
- Allure to build reports

[Read more.](https://codecept.io/playwright/#setup)

## Folder structure

We store e2e logic in `test-e2e` folder. Test suites are located in `tests` folder, where each file represents a component / page being tested. If there are several features to test for one page / component, then it is recommended to organize them in a subfolder.

There are two config files for desktop and mobile testing. By default each test suite works for both mobile and desktop pack. In order to limit test suite as one suitable only for one platform, it is possible to write `(@mobile-only)` in the Scenario description.

In the `data` folder we store ott-app configs necessary for testing purposes. To load config in the test suite it is possible to use `I.useConfig(__CONFIG_NAME__);` function.

`output` folder consists of allure test reports and screenshots of failed tests (with `mobile` and `desktop` subfolders to separate test results).

`utils` folder can be used to store common utils / asserts necessary for test suits.

## Test suite

Each test suite is a separate file located in the `tests` folder. It is necessary to label the suite with the following feature code: `Feature('account').retry(3);` . In order to reduce the chance of unintended failures it is also better to define retry count. This way a test will be relaunched several times in case it failed.

**TODO:** use `allure.createStep` to have readable steps in allure reports. [Read more.](https://codecept.io/plugins/#allure)

## Tests launching

We use several workers to launch tests for each platform. That increases the speed and guaranties the autonomy of each Scenario.

**(!)** In order to support allure reports it is necessary to install Java 8.

Basic commands:

`yarn codecept:mobile` -  to run tests for a mobile device
`yarn codecept:desktop`: - to run tests for desktop
`yarn serve-report:mobile` - to serve allure report from "./output/mobile" folder
`yarn serve-report:desktop` - to serve allure report from "./output/desktop" folder
`yarn codecept-serve:mobile` - to run desktop tests and serve the report
`yarn codecept-serve:desktop` - to run mobile tests and serve the report

## GitHub Actions

We have two actions: one for desktop and one for mobile device. Each one runs independently. After the action run it is possible to download an artifact with an allure report and build a nice report locally. 

To do it on Mac: `allure serve ~/Downloads/allure-report-desktop`

To serve allure reports locally `allure-commandline` package should be installed globally.

## Simple steps to run tests locally for desktop

1. Install Java 8 (for Mac homebrew `adoptopenjdk8` package can be used)
2. `yarn install`
3. Install `allure-commandline` globally (can help in the future to serve downloaded artifacts)
4. Run `yarn codecept-serve:desktop` 
