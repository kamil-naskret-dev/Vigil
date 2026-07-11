export interface HttpCheckResult {
  statusCode: number;
  responseTimeMs: number;
}

export interface IHttpClient {
  check(url: string): Promise<HttpCheckResult>;
}