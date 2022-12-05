interface ApiResponse {
  errors: string[];
}
type ServiceResponse<R> = { responseData: R } & ApiResponse;
type ServiceRequest<P, R> = (payload: P) => Promise<ServiceResponse<R>>;
type CleengEmptyRequest<R> = (sandbox: boolean) => Promise<ServiceResponse<R>>;
type CleengEmptyAuthRequest<R> = (sandbox: boolean, jwt: string) => Promise<ServiceResponse<R>>;
type CleengRequest<P, R> = (payload: P, sandbox: boolean) => Promise<ServiceResponse<R>>;
type CleengAuthRequest<P, R> = (payload: P, sandbox: boolean, jwt: string) => Promise<ServiceResponse<R>>;
