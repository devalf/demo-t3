import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import cookieParser from 'cookie-parser';

import { AppModule } from './app/app.module';
import { HttpExceptionFilter } from './app/common/filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  const globalPrefix = 'api';

  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();
  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('Demo-t3 Swagger API')
    .setDescription('API documentation for demo-t3, without any authorization')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.NX_PUBLIC_SERVER_NEST_PORT || 8083;

  await app.listen(port);

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
