import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger as WinstonLogger } from 'winston';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<{
      method: string;
      path: string;
      requestId?: string;
    }>();
    const { method, path, requestId } = req;
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context
            .switchToHttp()
            .getResponse<{ statusCode: number }>();
          this.logger.info(`${method} ${path} ${res.statusCode}`, {
            context: 'HTTP',
            requestId,
            method,
            path,
            statusCode: res.statusCode,
            durationMs: Date.now() - start,
          });
        },
        error: (err: Error) => {
          this.logger.warn(`${method} ${path} ERROR`, {
            context: 'HTTP',
            requestId,
            method,
            path,
            durationMs: Date.now() - start,
            error: err.message,
          });
        },
      }),
    );
  }
}
