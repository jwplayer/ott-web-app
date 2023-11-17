interface ApiResponse {
  errors: string[];
}

type CleengResponse<R> = { responseData: R } & ApiResponse;
type CleengRequest<P, R> = (payload: P, sandbox: boolean) => Promise<CleengResponse<R>>;
