interface ApiResponse {
  errors: string[];
}
type CleengResponse<R> = { responseData: R } & ApiResponse;
type CleengEmptyRequest<R> = (sandbox: boolean) => Promise<CleengResponse<R>>;
type CleengEmptyAuthRequest<R> = (sandbox: boolean, jwt: string) => Promise<CleengResponse<R>>;
type CleengRequest<P, R> = (payload: P, sandbox: boolean) => Promise<CleengResponse<R>>;
type CleengAuthRequest<P, R> = (payload: P, sandbox: boolean, jwt: string) => Promise<CleengResponse<R>>;
