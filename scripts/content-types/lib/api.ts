import { confirmPrompt, error } from './utils';

interface UploadOptions {
  host: string;
  apiKey: string;
  siteId: string;
}

export async function uploadSchema(schema: Schema<Field, Section<Field>>, options: UploadOptions, autoReplace: boolean) {
  console.info(`\r\nCreating schema "${schema.name}"`);
  const response = await fetch(`${options.host}/v2/sites/${options.siteId}/content_type_schemas/`, {
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
    error('Access denied. Check your api key and site ID and then try again.', 'NotAuthorized');
  } else if (response.status === 409) {
    console.info(` Conflict. Checking if schema "${schema.name}" already exists.`);

    // If the schema exists, ask if you want to overwrite it
    const id = (await getSchema(schema.name, options))?.id;

    if (id && (autoReplace || (await confirmPrompt(` A schema with name "${schema.name}" already exists with ID ${id}.`, ' Do you want to overwrite it?')))) {
      await updateSchema(id, schema, options);
    } else {
      console.info(` Skipped "${schema.name}"`);
    }
  } else {
    console.error(` Error creating ${schema.name}: ${response.status} - ${JSON.stringify(await response.json())}`);
  }
}

async function updateSchema(id: string, schema: Schema<Field, Section<Field>>, options: UploadOptions) {
  const response = await fetch(`${options.host}/v2/sites/${options.siteId}/content_type_schemas/${id}`, {
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
  const response = await fetch(`${options.host}/v2/sites/${options.siteId}/content_type_schemas?q=name:${name}`, {
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
