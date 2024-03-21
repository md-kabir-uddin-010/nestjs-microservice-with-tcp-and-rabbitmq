import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

// custom validatio error object
const CustomValidationErrorObject = (
  validationErrors: ValidationError[] = [],
) => {
  const result = validationErrors.reduce((acc, error) => {
    acc[error.property] = Object.values(error.constraints).join(', ');
    return acc;
  }, {});

  return new BadRequestException(result);
};

async function bootstrap() {
  // const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  //   AppModule,
  //   {
  //     transport: Transport.RMQ,
  //     options: {
  //       urls: ['amqp://localhost:5672'],
  //       queue: 'notification_queue',
  //       queueOptions: {
  //         durable: false,
  //       },
  //     },
  //   },
  // );

  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     exceptionFactory: CustomValidationErrorObject,
  //     stopAtFirstError: true,
  //     transform: true,
  //     whitelist: true,
  //   }),
  // );
  // await app.listen();

  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: CustomValidationErrorObject,
      stopAtFirstError: true,
      transform: true,
      whitelist: true,
    }),
  );

  // start TCP Protocol micreoservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '127.0.0.1',
      port: 3004,
    },
  });

  // start RabbitMQ Protocol micreoservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'notification_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices();

  await app.listen(3004);

  // log app runing url
  console.log(`notification-service is running on - ${await app.getUrl()}`);
}
bootstrap();
