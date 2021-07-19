type CleengResponse<R> = { errors: [string], responseData: R };
type CleengRequest<P, R> = (payload: P, sandbox: boolean) => Promise<CleengResponse<R>>;
type CleengAuthRequest<P, R> = (payload: P, sandbox: boolean, jwt: string) => Promise<CleengResponse<R>>;
