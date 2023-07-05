import { uploadSchema } from './lib/api';
import { parseSchemas } from './lib/parse-schemas';
import { apiKeyPrompt, confirmPrompt, getRequiredParam } from './lib/utils';

// These options should not typically be used, so set as env vars instead of regular args
const JWP_HOST = process.env.JWP_HOST || 'https://api.jwplayer.com';
const AUTO_CONFIRM = process.env.AUTO_CONFIRM === '1';
const AUTO_REPLACE = process.env.AUTO_REPLACE === '1';

async function run() {
  console.info('-------------------------------------------------------');
  console.info('|           Load Content Types                        |');
  console.info('-------------------------------------------------------');

  const args: { [key: string]: string } = Object.fromEntries(
    process.argv.filter((arg) => arg.startsWith('--') && arg.includes('=')).map((arg) => arg.substring(2).split('=', 2)),
  );

  if (args['help'] || Object.keys(args).length === 0) {
    console.info('\r\nThis script can be used to upload content types to your JWP environment');
    console.info('\r\n\r\nUsage: ts-node load-content-types --site-id=<JWP site ID> [optional arguments]');
    console.info('\r\n\r\nRequired argument: site-id - specify the JWP property ID to upload to');
    console.info('Optional argument: source-file - specify a schema file to upload (defaults to ./content-types.json');
    console.info(
      'Optional argument: filter - specify a CSV list of schema names in order to limit the schemas to be uploaded to a subset of those found in the source file',
    );

    process.exit(0);
  }

  const file = args['source-file'] || `${__dirname}/content-types.json`;
  const apiKey = await apiKeyPrompt();
  const siteId = getRequiredParam(args, 'site-id', 8);
  const contentTypesFilter = args['filter']
    ?.split(',')
    .filter((t) => !!t)
    .map((t) => t.trim());

  if (contentTypesFilter) {
    console.info(`Filtering parameter is set. Only including the following schema(s): ${contentTypesFilter.map((t) => `"${t}"`).join(',')}`);
  }
  const schemas = parseSchemas(file, contentTypesFilter);

  if (AUTO_CONFIRM || (await confirmPrompt(`About to load ${schemas.length} content type(s) from ${file} into property ${siteId}`))) {
    console.info(`\r\nLoading ${schemas.length} content types from ${file} into property ${siteId}`);
  } else {
    console.info('\r\nUser cancelled');
    process.exit(1);
  }

  for (const schema of schemas) {
    await uploadSchema(schema, { host: JWP_HOST, siteId, apiKey }, AUTO_REPLACE);
  }
}

run().then(() => console.info('\r\nProcess complete. Check the logs for individual upload results.\r\n'));
