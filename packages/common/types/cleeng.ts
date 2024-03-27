interface ApiResponse {
  errors: string[];
}

export type CleengResponse<R> = { responseData: R } & ApiResponse;
export type CleengRequest<P, R> = (payload: P) => Promise<CleengResponse<R>>;
