type FormValidationErrors = Record<string, string[]>;

export class FormValidationError extends Error {
  public errors: FormValidationErrors;

  constructor(errors: FormValidationErrors) {
    super(Object.values(errors)[0][0]);

    this.errors = errors;
  }
}
