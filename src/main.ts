import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import {
  AppExceptionFilter,
  DomainErrorFilter,
  FallbackExceptionFilter,
  HttpExceptionFilter,
} from './interface/filters/app-exception.filter';
import { RequestIdInterceptor } from './interface/interceptors/request-id.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'validator.swagger.io'],
          connectSrc: ["'self'"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      frameguard: { action: 'deny' },
      noSniff: true,
      hidePoweredBy: true,
      crossOriginEmbedderPolicy: false,
      referrerPolicy: { policy: 'no-referrer' },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(
    new FallbackExceptionFilter(),
    new DomainErrorFilter(),
    new HttpExceptionFilter(),
    new AppExceptionFilter(),
  );

  app.useGlobalInterceptors(new RequestIdInterceptor());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
