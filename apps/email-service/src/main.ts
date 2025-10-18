import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { QUEUES } from '@demo-t3/models';

import { AppModule } from './app/app.module';

const { NX_PUBLIC_RABBITMQ_URL, NX_PUBLIC_EMAIL_SERVICE_PORT } = process.env;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  const rmqUrl = NX_PUBLIC_RABBITMQ_URL;

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rmqUrl],
      queue: QUEUES.EMAIL_SERVICE,
      queueOptions: {
        durable: true,
      },
      noAck: false,
      prefetchCount: 1,
    },
  });

  const globalPrefix = 'api';

  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Demo-t3 Swagger API')
    .setDescription('API documentation for email service')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);

  // Start both HTTP server and microservices
  await app.startAllMicroservices();
  await app.listen(NX_PUBLIC_EMAIL_SERVICE_PORT);

  Logger.log(
    `Application is running on: http://localhost:${NX_PUBLIC_EMAIL_SERVICE_PORT}/${globalPrefix}`
  );
  Logger.log(`Email microservice connected to RabbitMQ`);
}

bootstrap();
