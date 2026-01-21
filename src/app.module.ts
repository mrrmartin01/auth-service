import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'postgres_db',
      port: 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'users_db',
      entities: [],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
