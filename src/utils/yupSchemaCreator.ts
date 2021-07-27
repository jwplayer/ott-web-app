/* eslint-disable @typescript-eslint/no-explicit-any */
import * as yupRaw from 'yup';
import type { AnySchema } from 'yup';
import type Reference from 'yup/lib/Reference';
import type Lazy from 'yup/lib/Lazy';

const yup: any = yupRaw;

export function createYupSchema(
  schema: Record<string, any>,
  config: Record<string, any>,
): Record<string, AnySchema<any, any, any> | Reference<unknown> | Lazy<any, any>> {
  const { name, validationType, validations = [] } = config;

  if (!yup[validationType] || !validations) {
    return schema;
  }

  let validator = yup[validationType]();
  validations.forEach((validation: any) => {
    const { params, type } = validation;
    if (!validator[type]) {
      return;
    }
    validator = validator[type](...params);
  });
  schema[name] = validator;
  return schema;
}
