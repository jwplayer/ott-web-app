import type { PersonalDetailsCustomField } from 'types/account';

export type CleengCaptureField = {
  key: string;
  enabled: boolean;
  required: boolean;
  value?: string;
  question?: string;
  answer: string | null | Record<string, unknown>;
};

export const deconstructCustomField = (
  field: CleengCaptureField,
): { values?: string[]; value?: string; type: PersonalDetailsCustomField['type'] } => {
  if (!field.value) return { type: 'text' };
  const values = field.value.split(';');

  if (values.length == 1) {
    return { value: values[0], type: 'checkbox' };
  } else if (values.length == 2) {
    return { values: values, type: 'radio' };
  } else {
    return { values: values, type: 'dropdown' };
  }
};
