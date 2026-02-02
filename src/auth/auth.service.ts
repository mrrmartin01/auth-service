import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import * as argon2 from 'argon2';
import { User } from '../users/entity/Users.entity';
import { RefreshToken } from './entity/RefreshToken.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>
  ) {}

  // ACCESS TOKEN
  generateAccessToken(user: User): string {
    return this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        roles: user.roles,
        address: user?.address,
        firstName: user.firstName,
        lastName: user.lastName,
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

    const refreshToken = this.refreshTokenRepository.create({
      jti,
      userId,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await this.refreshTokenRepository.save(refreshToken);

    return token;
  }

  // GLOBAL REVOCATION
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      {
        userId,
        revokedAt: IsNull(),
      },
      {
        revokedAt: new Date(),
      }
    );
  }

  // LOGIN / REGISTER HELPER
  async generateTokens(user: User) {
    return {
      access_token: this.generateAccessToken(user),
      refresh_token: await this.generateRefreshToken(user.id),
      token_type: 'Bearer',
    };
  }
}
