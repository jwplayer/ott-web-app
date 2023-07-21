// Note: Only the properties of schemas that we need for scripting are defined here.
// Let any other validation come from the API, otherwise we risk dupe validation getting outdated / out of sync.

interface SchemaFile {
  fields: {
    [key: string]: Field;
  };
  sections: {
    [key: string]: Section<Field | string>;
  };
  schemas: Schema<Field | string, Section<Field | string> | string>[];
}

type Field = unknown;

type Section<TField extends Field | string> = unknown & {
  fields: TField[];
};

type Schema<TField extends Field | string, TSection extends Section<TField> | string> = unknown & {
  name: string;
  sections: TSection[];
};
