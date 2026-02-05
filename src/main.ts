import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

const REQUIRED_ENV = [
  'DATABASE_URL',
  'JWT_SECRET_KEY',
  'REFRESH_TOKEN_SECRET',
] as const;

async function bootstrap() {
  console.log('Users microservice is starting...');
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.NATS,
      options: {
        servers: ['nats://nats'],
      },
    }
  );

  const config = app.get(ConfigService);
  const missing = REQUIRED_ENV.filter((key) => !config.get<string>(key));
  if (missing.length > 0) {
    console.error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
        'Set them in users-microservice/.env or pass them when running the container (e.g. docker-compose uses env_file: ./users-microservice/.env).'
    );
    process.exit(1);
  }

  await app.listen();
}
bootstrap().catch(() => console.error('Users microservice failed to start'));
