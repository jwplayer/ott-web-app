/* eslint @typescript-eslint/no-var-requires: "off" */
const fs = require('fs');
const stdIn = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

// @ts-ignore
const fetch = require('node-fetch');

// interface Field {
//   label: string,
//   param: string,
//   required?: boolean,
//   options: {
//     field_type: 'input' | 'toggle',
//     placeholder: string
//   }
// }
//
// interface FieldSet {
//   title: String,
//   fields: Field[]
// }
//
// interface Schema {
//   name: string,
//   description: string,
//   display_name: string,
//   is_series?: boolean,
//   is_active?: boolean,
//   hosting_type: 'hosted' | 'external' | 'ott_data',
//   fields: FieldSet[]
// }

function error(message: string, returnCode?: number): never {
  console.error(message);
  process.exit(returnCode === undefined ? -1 : returnCode);
}

type ArgOptions<T extends boolean> = {
  required: T;
  allowBlank?: boolean;
};

interface ArgReturn {
  value: string;
}

type ArgReturnType<T> = T extends true ? ArgReturn : ArgReturn | undefined;

function getArg<T extends boolean>(arg: string, options?: ArgOptions<T>): ArgReturnType<T> {
  const value = process.argv.find((it) => it.startsWith(`--${arg}=`) || it === `--${arg}`)?.replace(`--${arg}=`, '');

  console.info(arg + ' ' + value);
  if (!value) {
    if (options?.required) {
      error(`${arg} is required. Please include the "--${arg}=<value>" argument`, -2);
    }

    return undefined as ArgReturnType<T>;
  }

  // Wrap value to be able to differentiate missing from blank optional values (i.e. --help)
  return {
    value,
  };
}

async function confirmPrompt(message: string) {
  console.info(`${message}\r\nDo you want to continue? (y/N)`);

  const response = await stdIn[Symbol.asyncIterator]().next();

  if (response.value.toLowerCase() !== 'y') {
    console.info('User cancelled');
    process.exit(1);
    return false;
  }
}

function help() {
  console.info('\r\nThis script can be used to upload content types to your JWP environment');
  console.info('\r\n\r\nUsage: ts-node load-content-types --site-id=<JWP site ID> --api-key=<JWP V2 API Key>');
  console.info('\r\n\r\nRequired arguments:');
  console.info('\r\n\r\nRequired arguments:');
}

async function uploadSchemas(args: { apiKey: string; siteId: string; schemas: unknown[] }) {
  console.info('\r\n\r\nCreating schemas:');

  for (const schema of args.schemas) {
    const response = await fetch(`https://api.jwplayer.com/v2/sites/${args.siteId}/content_type_schemas/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${args.apiKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metadata: schema,
      }),
    });

    if (response.ok) {
      // @ts-ignore
      console.info(`Created ${schema.name}`);
    } else if (response.status === 403) {
      error('Access denied. Check your api key and site ID and then try again.', -5);
    } else {
      // @ts-ignore
      console.error(`Error creating ${schema.name}: ${response.status} - ${JSON.stringify(await response.json())}`);
    }
  }
}

async function run() {
  console.info('\r\n\r\nLoad Content Types\r\n');

  if (getArg('help')) {
    help();
    process.exit(0);
  }

  const file = getArg<true>('source-file')?.value || `${__dirname}/content-types.json`;
  const apiKey: string = getArg('api-key', { required: true }).value;
  const siteId: string = getArg('site-id', { required: true }).value;

  let schemas: unknown[];

  try {
    schemas = JSON.parse(fs.readFileSync(file, 'utf-8')) as unknown[];
  } catch (e: unknown) {
    error(`Error loading schemas from ${file}\r\n${e}`, -3);
  }

  if (schemas.length <= 0) {
    error(`Error! No schemas found in file ${file}`, -4);
  }
  await confirmPrompt(`About to load ${schemas.length} content types from ${file} into property ${siteId}`);
  await uploadSchemas({ siteId, apiKey, schemas });
}

run()
  .then(() => console.info('\r\nProcess complete. Check the logs for individual upload results.\r\n'))
  .finally(() => {
    stdIn.close();
  });
