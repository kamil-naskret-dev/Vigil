import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const SWAGGER_TITLE = 'Vigil API';
const SWAGGER_DESCRIPTION = 'Self-hosted uptime monitoring API';
const SWAGGER_VERSION = '1.0';
const SWAGGER_PATH = 'docs';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle(SWAGGER_TITLE)
    .setDescription(SWAGGER_DESCRIPTION)
    .setVersion(SWAGGER_VERSION)
    .addBearerAuth()
    .addTag('Auth', 'Registration, login and token management')
    .addTag('Monitors', 'Monitor CRUD and lifecycle management')
    .addTag('Checks', 'Check history and statistics')
    .addTag('Dashboard', 'User dashboard summary')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(SWAGGER_PATH, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
}