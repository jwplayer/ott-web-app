/* eslint @typescript-eslint/no-var-requires: "off" */
const fs = require('fs');
const readline = require('readline');

const JWP_HOST = process.env.JWP_HOST || 'https://api.jwplayer.com';

interface SchemaFile {
  fields: {
    [key: string]: Field;
  };
  sections: {
    [key: string]: Section<Field | string>;
  };
  schemas: Schema<Field | string, Section<Field | string> | string>[];
}

// TODO: Use yup to validate schema
interface Field {
  label: string;
  param: string;
  required?: boolean;
  details: {
    field_type: 'input' | 'toggle';
    placeholder: string;
  };
}

interface Section<TField extends Field | string> {
  title: string;
  fields: TField[];
}

interface Schema<TField extends Field | string, TSection extends Section<TField> | string> {
  name: string;
  description: string;
  display_name: string;
  is_series?: boolean;
  is_active?: boolean;
  hosting_type: 'hosted' | 'external' | 'ott_data';
  sections: TSection[];
}

function error(message: string, returnCode?: number): never {
  console.error(message);
  process.exit(returnCode === undefined ? -1 : returnCode);
}

async function confirmPrompt(message: string, confirmMessage: string = 'Do you want to continue?') {
  const stdIn = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    stdIn.setPrompt(`${message}\r\n${confirmMessage} (y/N) `);
    stdIn.prompt();
    const response = await stdIn[Symbol.asyncIterator]().next();

    if (response.done) {
      process.exit(1);
    }

    return response.value?.toLowerCase() === 'y';
  } finally {
    stdIn.close();
  }
}

function help() {
  console.info('\r\nThis script can be used to upload content types to your JWP environment');
  console.info('\r\n\r\nUsage: ts-node load-content-types --site-id=<JWP site ID> --api-key=<JWP V2 API Key> [optional arguments]');
  console.info('\r\n\r\nRequired argument: site-id - specify the JWP property ID to upload to');
  console.info('Required argument: api-key - specify the V2 API key found on the API Credentials page of the JWP dashboard');
  console.info('Optional argument: source-file - specify a schema file to upload (defaults to ./content-types.json');
}

function parseSchemas(file: string) {
  try {
    const schemaDefinitions = JSON.parse(fs.readFileSync(file, 'utf-8')) as SchemaFile;

    if (schemaDefinitions.schemas.length <= 0) {
      error(`Error! No schemas found in file ${file}`, -4);
    }

    const mapSchema = (schema: Schema<Field | string, Section<Field | string> | string>) => {
      const lookup = <TKey extends keyof Omit<SchemaFile, 'schemas'>, TValue extends SchemaFile[TKey]['']>(
        schemaDefs: SchemaFile,
        key: TKey,
        value: TValue | string,
      ): TValue => {
        const references = schemaDefs[key] as { [key: string]: TValue };
        // If a string is used, treat it as a lookup for the field / section by key
        if (typeof value === 'string') {
          if (!references[value]) {
            error(`Reference ${key} "${value}" not found for schema "${schema.name}"`, -10);
          }

          return references[value];
        }

        return value;
      };
      return {
        ...schema,
        sections: schema.sections
          .map((section) => lookup(schemaDefinitions, 'sections', section))
          .map((section) => ({
            ...section,
            fields: section.fields.map((field) => lookup(schemaDefinitions, 'fields', field)),
          })),
      };
    };

    return schemaDefinitions.schemas.map(mapSchema);
  } catch (e: unknown) {
    error(`Error loading schemas from ${file}\r\n${e}`, -3);
  }
}

interface UploadOptions {
  apiKey: string;
  siteId: string;
}

async function uploadSchemas(schemas: Schema<Field, Section<Field>>[], options: UploadOptions) {
  console.info('\r\nCreating schemas:');

  for (const schema of schemas) {
    await createSchema(schema, options);
  }
}

async function createSchema(schema: Schema<Field, Section<Field>>, options: UploadOptions) {
  console.info(`\r\nCreating schema "${schema.name}"`);
  const response = await fetch(`${JWP_HOST}/v2/sites/${options.siteId}/content_type_schemas/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      metadata: schema,
    }),
  });

  if (response.ok) {
    console.info(` Created "${schema.name}"`);
  } else if (response.status === 403) {
    error('Access denied. Check your api key and site ID and then try again.', -5);
  } else if (response.status === 409) {
    console.info(` Conflict. Checking if schema "${schema.name}" already exists.`);

    // If the schema exists, ask if you want to overwrite it
    const id = (await getSchema(schema.name, options))?.id;

    if (id && (await confirmPrompt(` A schema with name "${schema.name}" already exists with ID ${id}.`, ' Do you want to overwrite it?'))) {
      await updateSchema(id, schema, options);
    }
  } else {
    console.error(` Error creating ${schema.name}: ${response.status} - ${JSON.stringify(await response.json())}`);
  }
}

async function updateSchema(id: string, schema: Schema<Field, Section<Field>>, options: UploadOptions) {
  const response = await fetch(`${JWP_HOST}/v2/sites/${options.siteId}/content_type_schemas/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      metadata: schema,
    }),
  });

  if (response.ok) {
    console.info(` Updated schema "${schema.name}" with ID "${id}"`);
  } else {
    console.error(` Error updating schema "${schema.name}" with ID "${id}": ${response.status} - ${JSON.stringify(await response.json())}`);
  }
}

async function getSchema(name: string, options: UploadOptions) {
  const response = await fetch(`${JWP_HOST}/v2/sites/${options.siteId}/content_type_schemas?q=name:${name}`, {
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error(` Error finding schema "${name}": ${JSON.stringify(await response.json())}`);
    return undefined;
  }

  const responseData = (await response.json()) as { content_type_schemas?: { id: string; metadata: Schema<Field, Section<Field>> }[] };

  if (!responseData.content_type_schemas || responseData.content_type_schemas.length !== 1) {
    console.error(` Error finding schema "${name}". ${responseData.content_type_schemas?.length ?? 'No'} schemas found.`);
    return undefined;
  }

  if (!responseData.content_type_schemas[0].id) {
    console.error(`Error finding schema "${name}". ID not found in response: ${JSON.stringify(responseData.content_type_schemas[0])}`);
    return undefined;
  }

  return {
    id: responseData.content_type_schemas[0].id,
    schema: responseData.content_type_schemas[0].metadata,
  };
}

async function run() {
  console.info('-------------------------------------------------------');
  console.info('|           Load Content Types                        |');
  console.info('-------------------------------------------------------');

  const args = Object.fromEntries(process.argv.filter((arg) => arg.startsWith('--') && arg.includes('=')).map((arg) => arg.substring(2).split('=', 2)));

  if (args['help'] || Object.keys(args).length === 0) {
    help();
    process.exit(0);
  }

  const getRequired = (key: string) => {
    if (!args[key]) {
      error(`"${key}" is required. Please include the "--${key}=<value>" argument`, -2);
    }
    return args[key];
  };

  const file = args['source-file'] || `${__dirname}/content-types.json`;
  const apiKey = getRequired('api-key');
  const siteId = getRequired('site-id');

  const schemas = parseSchemas(file);

  if (args['confirm'] !== '1' && !(await confirmPrompt(`About to load ${schemas.length} content types from ${file} into property ${siteId}`))) {
    console.info('User cancelled');
    process.exit(1);
  } else {
    console.info(`Loading ${schemas.length} content types from ${file} into property ${siteId}`);
  }

  await uploadSchemas(schemas, { siteId, apiKey });
}

run().then(() => console.info('\r\nProcess complete. Check the logs for individual upload results.\r\n'));
