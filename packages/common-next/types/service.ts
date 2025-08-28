interface ApiResponse {
  errors: string[];
}

export type ServiceResponse<R> = { responseData: R } & ApiResponse;
export type PromiseRequest<P, R> = (payload: P) => Promise<R>;
export type EmptyServiceRequest<R> = () => Promise<ServiceResponse<R>>;
export type EmptyEnvironmentServiceRequest<R> = () => Promise<ServiceResponse<R>>;
export type EnvironmentServiceRequest<P, R> = (payload: P) => Promise<ServiceResponse<R>>;
