export type UseFormChangeHandler = React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
export type UseFormBlurHandler = React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
export type UseFormSubmitHandler = React.FormEventHandler<HTMLFormElement>;

export type GenericFormErrors = { form: string };
export type GenericFormValues = Record<string, string | boolean | GenericFormValues>;
export type FormErrors<T> = Partial<T & GenericFormErrors>;
export type FormValues<T> = Partial<T & GenericFormValues>;
