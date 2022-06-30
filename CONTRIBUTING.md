# Contributing to JW OTT Webapp

Thanks for considering contributing to our repo! We appreciate all contributions to the app, large or small. Please take the time to read through this document before making a contribution to ensure a fun and effective process for everyone involved.

You can read the [Developer Guidelines](./docs/developer-guidelines.md) for advice on how to get your development environment setup.

## General guidelines

Are you having trouble getting started with the OTT Web App, configuration, or customization? If so, please check the [developer docs](https://github.com/jwplayer/ott-web-app/tree/develop/docs) before submitting an issue here.

## Official Support

This guide is focused specifically for developers contributing towards this open-source project. If you pay for JW Player, you're entitled to direct help from our support team [here](https://support.jwplayer.com/customer/portal/emails/new).

## Bug Reports

A bug is a demonstrable problem caused by code in the repository. Bug reports are very helpful! If you think you've found a bug we'd love to know about it (and fix it).

### Hold Up!

Before submitting an issue, please do your best to confirm that your issue is reproducible and a problem with our codebase by running through this checklist.  Afterwards, if you're still unsure about the cause of your problem, please feel free to submit an issue and we'll do our best to help. For issues building & developing the app, skip this guide and submit a report directly.

#### Issue Checklist

1. Check the console:
   - Are there any network errors (404, 403, 500, etc)? 
   - Is there a CORS error (access-control-allow-origin)? 
   - Are there errors thrown by third-party code or dependencies?
2. Check your app:
   - Are you using the latest version? 
   - You can test streams with the latest version here.
   - Is your Configuration valid?
3. Check your browser:
   - Are you using a supported browser?
   - Are you using the latest version? 
   - Does the browser support the feature you're trying to use? 
   - Do we implement the feature you're using?
4. Check your OS (Mobile):
   - Are you using a supported device?
   - Are you running the latest version?
5. Check your code:
   - Have you made any changes to the codebase? 
   - Are you using the [API](https://developer.jwplayer.com/jwplayer/docs) correctly?
6. Check through our [issues](https://github.com/jwplayer/ott-web-app/issues) and make sure your's isn't already
reported or resolved.

#### You've Found an Issue

Great! Please [create an issue](https://github.com/jwplayer/ott-web-app/issues/new) and follow the guidelines as best as you can - each ask gives us information necessary to solve your problem. If submitting a playback issue, make sure we can access your video at all times. If live, ensure that you provide us with the failing segments.

And if you're able to, please isolate your issue by creating a standalone test page.

Test Page Template:

```html
<html>
    <body>
        <div id="root"></div>
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <script type="module" src="/dist/index.js"></script>
    </body>
</html>
```

## Pull Requests

Pull requests are a great way to help out and improve the JW OTT App. Before embarking on a large PR, please ask us first. We may not need the changes in the repo at this time and don't want you to waste your energy.

### More open-development than open-source

While open-source is in the DNA of JW Player, due to our growth as a business, changes to this repository will affect many video consumers every day. As a result, our governance of this repository needs to reflect that reality.

In the repository's current state certain changes are not compatible with our responsibility to both developers and our customers. Each change requires, at a minimum, product review and QA resource to test that it does not impact anything unexpectedly. Given we have our own roadmap and changes in the pipeline, allocating resources to review larger external changes is not something that's possible at this point in time. That said, there are certain types of contributions that we are more than happy to review and integrate.

#### Current Acceptable Contributions

- Bugfixes
- Typos/Clarity improvements
- Enhancement _suggestions_
- Extension of backend services to support additional, mainstream providers (see [docs/backend-services](docs/backend-services.md))

### First Timers

If you've never contributed before, don't worry - we'll do the best we can to help you throughout the process. Unsure of where to begin? Refer to the [Questions / Discussions](#Questions-/-Discussions) section and drop us a line.

### General Guidelines

While far from comprehensive, following these guidelines will get the easy stuff out of the way and speed the process along. In addition, please include a good description of what you've changed and why you've changed it. Please also read and follow the developer guidelines in [docs/developer-guidelines](docs/developer-guidelines.md).

##### Branch Naming

- Bugfixes: `bugfix/your-branch`
- Hotfixes: `hotfix/your-branch`

##### Style

1. This project uses vite to build and compile. **Code produced by the build must work across all supported browsers and devices - modern Chrome, FF, Safari, and Edge**
2. Ensure that your code matches the formatting of the codebase by running ```yarn format```
3. Ensure that your code follows our styleguide by passing our ESLint, Stylelint and TypeScript rules
   - You can run lint analysis by running ```yarn lint```
   - You can fix lint errors by running ```yarn format```
4. Ensure that your code passes lighthouse analysis by running ```npx lhci autorun```
5. Do your best to match our naming conventions and conform to the style of the code around you
6. If you have a large or messy commit history, please rebase & squash your commit history

##### Tests

1. Ensure that all existing tests pass
   - Run unit tests through `yarn test`
   - Run the e2e tests through `yarn codecept:mobile` and `yarn codecept:desktop`
2. We don't demand 100% coverage, but please write tests that cover at least the happy paths
   - Some code is hard to test or untestable - we won't hold it against you if you're working in a particularly difficult area. Just let us know if you've had some trouble
3. If your changes cannot be automated, include a manual test page that demonstrates the functionality of your changes

##### Size
1. Do your best to keep your PRs as small and focused as possible
   - If your PR is large, consider breaking it into smaller ones
2. **Large additions to the code base must be justified** - we strive to keep the codebase as small as possible
3. Additions to `package.json` must be backed by good reasons

## Feature Requests
Feature requests are also welcome, but may not fit within the scope of the application. It's up to you to make the case for your feature and convince us that it's worth implementing. We encourage you to try and solve your problem using the existing code, [services](docs/backend-services.md), or [Configuration](docs/configuration.md) first. As always, you're free to fork the repo and implement what you want - feel free to ask questions by following our [Questions / Discussions](#Questions-/-Discussions) guidelines.

### How Do I Submit A (Good) Feature Request?

Feature suggestions are initially tracked as [GitHub issues](https://guides.github.com/features/issues/). Once any questions have been resolved, it is marked as `answered` and subsequently transferred to our internal backlog. Any additional updates to the request will be communicated via the initial issue and the issue may be reopened as needed. Please use the bullets below to format and guide your submission.

* **Title** Use a clear and descriptive title for the issue to identify the suggestion.
* **Problem** Describe the problem you're trying to solve. Include the business goals driving this need. Explain why this feature would be useful to other JW Player users and isn't something that can or should be implemented in a fork or using the API. Please provide as much information as possible, as this is the most important section.
* **Current solutions / workarounds** How would you solve these problems today, even partially? What have you already tried? You can also list some other video players or applications where this feature already exists.
* **Proposed solutions (optional)** Feel free to make a specific suggestion of how you'd solve the problem. We love hearing suggestions, though we may not implement them literally.
* **Resources** Links/additional materials section. Do you have any research on this ask? Can you point us to any relevant documentation or articles that will help us understand your request?

## Questions / Discussions

We love to answer questions and talk with developers! Feel free to ask questions via [gitter](https://gitter.im/jwplayer/jwplayer?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge), the [video-dev-slack](https://video-dev.slack.com/messages/general/whats_new/), or by [creating an issue](https://github.com/jwplayer/ott-web-app/issues/new) . And if you're in the NYC area, you can come and meet us and other video devs in the flesh  at the [Video Tech NYC Meetup](https://www.meetup.com/Video-Tech-NYC/).

## Additional Notes

### Issue and Pull Request Labels

This section lists the labels we use to help us track and manage issues and pull requests. Please open an issue on `jwplayer/ott-web-app` if you have suggestions for new labels.

#### Type of Issue and Issue State

| Label name | Description |
| --- | --- |
| `stale` | Issues without activity in an abnormally long time or ones where the creator has not responded to the latest comment from a JW representative in 2 weeks time. Automatically closed in 1 week from label addition. |
| `invalid` | Issues that are opened that are not related to the open-source repository and would be better serviced by our support staff. Automatically closed after label addition. |
| `answered` | Issues deemed answered/completed by a JW representative. Automatically closed in 1 week from label addition. |
| `bug` | Confirmed bugs or reports that are very likely to be bugs. |
| `feature-request` | Feature requests. |
| `question` | Questions more than bug reports or feature requests (e.g. how do I do X). |

### Attribution

Parts of this Code of Conduct have been adapted from the contribution guidelines found in the [atom/atom repository](https://github.com/atom/atom/blob/master/CONTRIBUTING.md)
