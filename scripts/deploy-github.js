const { execSync } = require('child_process');
const { Buffer } = require('buffer');
const fs = require('fs');

const customDomain = getArg('--custom-domain').replace('https://', '').replace('http://', '');
const deploymentData = getDeploymentData();

function getDeploymentData() {
  if (customDomain) {
    if (customDomain.indexOf('/') >= 0) {
      throw 'Custom domain must be a valid domain without paths (i.e. "app-github.jwplayer.com", not "app-github.jwplayer.com/ott-web-app")';
    }

    return {
      baseUrl: '',
      deployUrl: `https://${customDomain}`,
    };
  }

  const gitUrlParts = sh(`git remote get-url ${getGitRemote()}`).replace('https://github.com/', '').split('/');

  if (gitUrlParts.length !== 2) {
    throw 'Unable to determine Org and Project from git url';
  }

  const githubOrg = gitUrlParts[0];
  const githubProject = gitUrlParts[1].slice(0, -4);

  return {
    baseUrl: githubProject,
    deployUrl: `https://${githubOrg}.github.io/${githubProject}`,
  };
}

function log(str) {
  console.info(`🐙 Github Deployment: ${str}`);
}

function shRead(bs = 100) {
  const buf = Buffer.alloc(bs);
  const len = fs.readSync(0, buf);
  return buf.toString('utf-8', 0, len - 1);
}

function sh(command, options) {
  return execSync(command, options).toString().trim();
}

function shPrint(command, options) {
  return execSync(command, { stdio: 'inherit', ...options });
}

function confirm(arg) {
  if (!process.argv.includes(arg)) {
    log('Are you sure? (y/N)');
    if (shRead().toLowerCase() !== 'y') {
      log('User cancelled');
      process.exit(1);
    }
  }
  return true;
}

function getArg(arg) {
  const buildFlags = process.argv.find((it) => it.startsWith(arg));
  if (!buildFlags) {
    return '';
  }
  return buildFlags.split('=').splice(1).join('=');
}

function getGitRemote() {
  return getArg('--git-remote') || 'origin';
}

function getEnv() {
  return {
    ...process.env,
    APP_GITHUB_PUBLIC_BASE_URL: process.env.APP_GITHUB_PUBLIC_BASE_URL || deploymentData.baseUrl,
    APP_PUBLIC_GITHUB_PAGES: true,
  };
}

function build() {
  log('Build step');

  if (!confirm('--build')) return;
  shPrint(`yarn build ${getArg('--build-args')}`, { env: getEnv() });
  if (customDomain) {
    fs.writeFileSync('./build/CNAME', customDomain);
  }
  shPrint('cp ./build/index.html ./build/404.html');
}

function deploy() {
  log('Deploy step');
  if (!confirm('--deploy')) return;
  shPrint(`yarn gh-pages -o ${getGitRemote()} -d build ${getArg('--deploy-args')}`, { env: getEnv() });
}

function help() {
  log(
    [
      'Displaying help message',
      '',
      'This script deploys ott-web-app to github pages. It executes "yarn build" and then "yarn gh-pages".',
      'During the build step it ensures that that APP_GITHUB_PUBLIC_BASE_URL envvar is set to the name of your github project or if you used --custom-domain argument, it ensures that proper CNAME file required by github is provided.',
      '',
      'Command line arguments:',
      "--build - don't ask for build confirmation",
      '--build-args="--help" - pass arguments to yarn build, in this case yarn build --help',
      "--deploy - don't ask for deploy confirmation",
      '--deploy-args="--help" - pass arguments to gh-pages, in this case gh-pages --help',
      '--github-remote="origin" - select github remote to use to detect github project name, default is "origin"',
      '--custom-domain="example.com" - (no slashes) deploy to custom domain instead of github directory',
      '',
    ].join('\n'),
  );
}

function run() {
  if (process.argv.includes('--help')) {
    help();
    return;
  }

  log(`Application will be located at ${deploymentData.deployUrl}`);

  build();
  deploy();

  log(`All done, don't forget to enable github pages for the gh-pages branch! Check out https://docs.github.com/en/pages for details.`);
}

run();
