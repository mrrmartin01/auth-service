import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import * as argon2 from 'argon2';
import { RefreshTokenEntity } from './entity/tokenEntity';
import { UsersEntity } from '../users/entity/UsersEntity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepo: Repository<RefreshTokenEntity>
  ) {}

  // ACCESS TOKEN
  generateAccessToken(user: UsersEntity): string {
    return this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        roles: user.roles,
        ver: user.tokenVersion,
        jti: randomUUID(),
        typ: 'access',
      },
      {
        secret: this.configService.get<string>('JWT_SECRET_KEY'),
        issuer: 'users-auth-service',
        audience: 'http-api-gateway',
        expiresIn: '15m',
      }
    );
  }

  // REFRESH TOKEN ISSUANCE
  async generateRefreshToken(userId: string): Promise<string> {
    const jti = randomUUID();

    const token = this.jwtService.sign(
      { sub: userId, jti, typ: 'refresh' },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }
    );

    const tokenHash = await argon2.hash(token, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });

    await this.refreshTokenRepo.save({
      jti,
      userId,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return token;
  }

  // GLOBAL REVOCATION
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepo.update(
      { userId, revokedAt: IsNull() },
      { revokedAt: new Date() }
    );
  }

  // LOGIN / REGISTER HELPER
  async generateTokens(user: UsersEntity) {
    return {
      access_token: this.generateAccessToken(user),
      refresh_token: await this.generateRefreshToken(user.id),
      token_type: 'Bearer',
    };
  }
}
