interface ApiResponse {
  errors: string[];
}

type ServiceResponse<R> = { responseData: R } & ApiResponse;
type PromiseRequest<P, R> = (payload: P) => Promise<R>;
type EmptyServiceRequest<R> = (sandbox: boolean) => Promise<ServiceResponse<R>>;
type EmptyAuthServiceRequest<R> = (sandbox: boolean, jwt: string) => Promise<ServiceResponse<R>>;
type ServiceRequest<P, R> = (payload: P) => Promise<ServiceResponse<R>>;
type EnvironmentServiceRequest<P, R> = (payload: P, sandbox: boolean) => Promise<ServiceResponse<R>>;
type AuthRequest<P, R> = (payload: P, sandbox: boolean, jwt: string) => Promise<R>;
type AuthServiceRequest<P, R> = (payload: P, sandbox: boolean, jwt: string) => Promise<ServiceResponse<R>>;
