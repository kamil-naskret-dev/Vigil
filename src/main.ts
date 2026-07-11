import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AppExceptionFilter, DomainErrorFilter, FallbackExceptionFilter, HttpExceptionFilter } from './interface/filters/app-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
