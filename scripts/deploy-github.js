const { exec, execSync } = require('child_process');
const { Buffer } = require('buffer');
const fs = require('fs');

require('./_dotenv.js');

function log(str) {
  console.info(`🐙 Github Deployment: ${str}`);
}

function shRead(bs=100) {
  const buf = Buffer.alloc(bs);
  const len = fs.readSync(0, buf);
  return buf.toString('utf-8', 0, len-1);
}

function sh(command, options) {
  return execSync(command, options).toString().trim();
}

function shPrint(command, options) {
  return execSync(command, { stdio: 'inherit', ...options });
}

function confirm(arg) {
  if (!process.argv.includes(arg)) {
    log('Are you sure? (y/n)');
    if (shRead() != 'y') {
      log('Skipping');
      return false;
    }
  }
  return true
}

function getArg(arg) {
  const buildFlags = process.argv.find(it => it.startsWith(arg));
  if (!buildFlags) {
    return '';
  }
  return buildFlags.split('=').splice(1).join('=');
}

function getGitRemote() {
  return getArg('--git-remote') || 'origin';
}

function getGitUrl() {
  return sh(`git remote get-url ${getGitRemote()}`);
}

function getGithubDir() {
  const url = getGitUrl();
  const ghProject = url.match(/([^/]+)\.git$/)[1];
  return ghProject;
}

function getGithubUser() {
  const url = getGitUrl();
  const ghUser = url.match(/:([^:]+)\//)[1];
  return ghUser;
}

function getBaseUrl() {
  const customDomain = getArg('--custom-domain');
  const envBaseUrl = process.env.SNOWPACK_PUBLIC_BASE_URL
  if (envBaseUrl) {
    return envBaseUrl;
  }
  const defaultBaseUrl = customDomain
    ? '/'
    : '/' + getGithubDir() + '/';
  return defaultBaseUrl;
}

function getEnv() {
  return {
    ...process.env,
    SNOWPACK_PUBLIC_BASE_URL: getBaseUrl(),
  }
}

function build() {
  log('Build step');
  const customDomain = getArg('--custom-domain');
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
  log([
    'Displaying help message',
    '',
    'This script deploys ott-web-app to github pages. It executes "yarn build" and then "yarn gh-pages".',
    'Druing the build step it ensures that that SNOWPACK_PUBLIC_BASE_URL envvar is set to the name of your github project or if you used --custom-domain argument, it ensures that proper CNAME file required by github is provided.',
    '',
    'Command line arguments:',
    "--build - don't ask for build confirmation",
    '--build-args="--help" - pass arguments to yarn build, in this case yarn build --help',
    "--deploy - don't ask for deploy confirmation",
    '--deploy-args="--help" - pass arguments to gh-pages, in this case gh-pages --help',
    '--github-remote="origin" - select github remote to use to detect github project name, default is "origin"',
    '',
  ].join('\n'));
}

function run() {
  if (process.argv.includes('--help')) {
    help();
    return;
  }

  const customDomain = getArg('--custom-domain');
  const url = customDomain
    ? `https://${customDomain}/`
    : `https://${getGithubUser()}.github.io/${getGithubDir()}`;

  log(`Application will be located at ${url}`);

  build();
  deploy();

  log(`All done, don't forget to enable github pages for the gh-pages branch! Check out https://docs.github.com/en/pages for details.`);
}

run();
