type FormValidationErrors = Record<string, string[]>;

export class FormValidationError extends Error {
  public errors: FormValidationErrors;

  constructor(errors: FormValidationErrors) {
    super(Object.values(errors).flat().join(';'));

    this.errors = errors;
  }
}
