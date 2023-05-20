export class FormErrors extends Error {
  errors: string[];

  constructor (errors: string[]) {
    super('Form errors: ' + errors.join('\n'));
    this.errors = errors;
  }
}
