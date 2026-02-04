// users-microservice/src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entity/Users.entity';
import { RefreshToken } from './entity/RefreshToken.entity';
import { generateRefreshToken, hashRefreshToken } from './lib/refresh-token';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AuthService {
  private readonly refreshSecret: string;
  private readonly refreshTtlMs = 7 * 24 * 60 * 60 * 1000;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>
  ) {
    const secret = this.configService.get<string>('REFRESH_TOKEN_SECRET');

    if (!secret) {
      throw new RpcException({
        status: 'error',
        message: 'REFRESH_TOKEN_SECRET is not defined',
        statusCode: 500,
      });
    }

    console.log('REFRESH_TOKEN_SECRET:', process.env.REFRESH_TOKEN_SECRET);

    this.refreshSecret = secret;
  }

  // ---------------- ACCESS TOKEN ----------------

  generateAccessToken(user: User): string {
    return this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        roles: user.roles,
        ver: user.tokenVersion,
        typ: 'access',
      },
      {
        secret: this.configService.get<string>('JWT_SECRET_KEY'),
        expiresIn: '15m',
        issuer: 'users-auth-service',
        audience: 'http-api-gateway',
      }
    );
  }

  // ---------------- REFRESH TOKEN ----------------

  async issueRefreshToken(userId: string): Promise<string> {
    const token = generateRefreshToken();
    const tokenHash = hashRefreshToken(token, this.refreshSecret);

    const expiresAt = new Date(Date.now() + this.refreshTtlMs);

    await this.refreshTokenRepo.upsert(
      {
        userId,
        tokenHash,
        expiresAt,
      },
      ['userId']
    );

    return token;
  }

  async rotateRefreshToken(
    userId: string,
    presentedToken: string
  ): Promise<string> {
    const newToken = generateRefreshToken();

    const oldHash = hashRefreshToken(presentedToken, this.refreshSecret);
    const newHash = hashRefreshToken(newToken, this.refreshSecret);

    const expiresAt = new Date(Date.now() + this.refreshTtlMs);

    const result = await this.refreshTokenRepo
      .createQueryBuilder()
      .update(RefreshToken)
      .set({
        tokenHash: newHash,
        expiresAt,
      })
      .where('userId = :userId', { userId })
      .andWhere('tokenHash = :oldHash', { oldHash })
      .andWhere('expiresAt > now()')
      .execute();

    if (result.affected !== 1) {
      throw new UnauthorizedException('Invalid or reused refresh token');
    }

    return newToken;
  }

  async revokeRefreshToken(userId: string): Promise<void> {
    await this.refreshTokenRepo.delete({ userId });
  }

  // ---------------- COMBINED ----------------

  async generateTokens(user: User) {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: await this.issueRefreshToken(user.id),
      tokenType: 'Bearer',
    };
  }
}
