#!/usr/bin/env node
import { execSync, spawn } from 'child_process';
import { resolve as resolvePath } from 'path';

import ansis from 'ansis';

type PackageEntry = {
  location: string;
  workspaceDependencies: string[];
  mismatchedWorkspaceDependencies: string[];
};

type PackageEntries = Record<string, PackageEntry>;

const packages = JSON.parse(JSON.parse(execSync('yarn --json workspaces info').toString()).data) as PackageEntries;
const args = process.argv.slice(2);

async function run(packageName: string, location: string) {
  return new Promise<void>((resolve, reject) => {
    let processData = '';
    const spawned = spawn('yarn', ['--cwd', location, 'run', ...args]);

    spawned.stdout.on('data', (data) => {
      processData += data;
    });

    spawned.on('exit', (exitCode) => {
      if (exitCode > 0) {
        process.stdout.write(`${ansis.yellowBright(packageName)}: ${ansis.red('Error')}\n\n`);
        process.stdout.write(resolvePath(location) + '\n');
        process.stdout.write(ansis.frame(processData) + '\n\n');
        reject();
      } else {
        process.stdout.write(`${ansis.yellowBright(packageName)}: ${ansis.green('OK')}\n`);
        resolve();
      }
    });
    spawned.on('error', (error) => {
      reject(error);
    });
  });
}

Promise.all(
  Object.entries(packages).map(([packageName, { location }]) => {
    return run(packageName, location);
  }),
)
  .then(() => {
    process.exit(0);
  })
  .catch((data) => {
    process.exit(1);
  });
