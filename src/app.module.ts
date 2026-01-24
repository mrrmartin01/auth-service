import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from './users/entity/UsersEntity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'users_db',
      port: 5432,
      username: process.env.DB_USERNAME || 'users_service',
      password: process.env.DB_PASSWORD || 'users_pass_very_secure_2026',
      database: process.env.DB_NAME || 'users_db',
      entities: [UsersEntity],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
