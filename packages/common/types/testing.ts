export type CopyProperties<T, V> = { [K in keyof T as T[K] extends V ? K : never]: T[K] };

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type MockedService<T> = CopyProperties<T, Function>;
