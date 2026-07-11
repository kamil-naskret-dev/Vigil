import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { IHttpClient, HttpCheckResult } from '../../core/application/monitor/ports/http-client.port';

const TIMEOUT_MS = 10_000;

@Injectable()
export class AxiosHttpClient implements IHttpClient {
  async check(url: string): Promise<HttpCheckResult> {
    const start = Date.now();

    const response = await axios.get(url, {
      timeout: TIMEOUT_MS,
      validateStatus: () => true,
    });

    return {
      statusCode: response.status,
      responseTimeMs: Date.now() - start,
    };
  }
}