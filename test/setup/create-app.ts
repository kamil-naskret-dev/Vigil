import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import {
  AppExceptionFilter,
  DomainErrorFilter,
  FallbackExceptionFilter,
  HttpExceptionFilter,
} from '../../src/interface/filters/app-exception.filter';

export async function createTestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  app.useGlobalFilters(
    new FallbackExceptionFilter(),
    new DomainErrorFilter(),
    new HttpExceptionFilter(),
    new AppExceptionFilter(),
  );

  await app.init();

  return app;
}
