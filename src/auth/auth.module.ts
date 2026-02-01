import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './entity/RefreshToken.entity';

@Module({
  imports: [
    JwtModule.register({
      signOptions: { algorithm: 'HS256' },
    }),
    TypeOrmModule.forFeature([RefreshToken]),
    ConfigModule,
  ],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
