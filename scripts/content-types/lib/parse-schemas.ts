import fs from 'fs';

import { error } from './utils';

export function parseSchemas(file: string, contentTypesFilter: undefined | string[]): Schema<Field, Section<Field>>[] | never {
  try {
    const schemaDefinitions = JSON.parse(fs.readFileSync(file, 'utf-8')) as SchemaFile;

    if (schemaDefinitions.schemas.length <= 0) {
      error(`Error! No schemas found in file ${file}`, 'NoSchemas');
    }

    return schemaDefinitions.schemas
      .filter((schema) => !contentTypesFilter || contentTypesFilter.includes(schema.name))
      .map((schema) => mapSchema(schemaDefinitions, schema));
  } catch (e: unknown) {
    return error(`Error loading schemas from ${file}\r\n${e}`, 'SchemaFileError');
  }
}

function mapSchema(schemaDefinitions: SchemaFile, schema: SchemaFile['schemas'][0]) {
  try {
    return {
      ...schema,
      sections: schema.sections
        .map((section) => lookup(schemaDefinitions, 'sections', section))
        .map((section) => ({
          ...section,
          fields: section.fields.map((field) => lookup(schemaDefinitions, 'fields', field)),
        })),
    };
  } catch (e: unknown) {
    throw new Error(`Error in schema "${schema.name}": ${e}`);
  }
}

function lookup<TKey extends keyof Omit<SchemaFile, 'schemas'>, TValue extends SchemaFile[TKey]['']>(
  schemaDefs: SchemaFile,
  key: TKey,
  value: TValue | string,
): TValue {
  const references = schemaDefs[key] as { [key: string]: TValue };
  // If a string is used, treat it as a lookup for the field / section by key
  if (typeof value === 'string') {
    if (!references[value]) {
      throw new Error(`Reference ${key} "${value}" not found`);
    }

    return references[value];
  }

  return value;
}
