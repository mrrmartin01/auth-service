import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { UsersEntity } from './users/entity/UsersEntity';
import { RefreshTokenEntity } from './auth/entity/tokenEntity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'users_db',
      port: 5432,
      username: process.env.DB_USERNAME || 'users_service',
      password: process.env.DB_PASSWORD || 'users_pass_very_secure_2026',
      database: process.env.DB_NAME || 'users_db',
      entities: [UsersEntity, RefreshTokenEntity],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
