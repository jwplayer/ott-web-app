interface ApiResponse {
  errors: string[];
}

type ServiceResponse<R> = { responseData: R } & ApiResponse;
type PromiseRequest<P, R> = (payload: P) => Promise<R>;
type EmptyServiceRequest<R> = () => Promise<ServiceResponse<R>>;
type EmptyEnvironmentServiceRequest<R> = () => Promise<ServiceResponse<R>>;
type EnvironmentServiceRequest<P, R> = (payload: P) => Promise<ServiceResponse<R>>;
