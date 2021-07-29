import type { CleengCaptureField, PersonalDetailsCustomField } from 'types/account';

export const deconstructCustomField = (
  field: CleengCaptureField,
): { values: string[]; type: PersonalDetailsCustomField['type'] } => {
  if (!field.value) return { type: 'text', values: [] };
  const values = field.value.split(';');

  if (values.length == 1) {
    return { values: values, type: 'checkbox' };
  } else if (values.length == 2) {
    return { values: values, type: 'radio' };
  } else {
    return { values: values, type: 'dropdown' };
  }
};
