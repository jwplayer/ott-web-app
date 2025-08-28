// Cleeng typings for generic API response structures

export type Response<R> = { responseData: R; errors: string[] };
