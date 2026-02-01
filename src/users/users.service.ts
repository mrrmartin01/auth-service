import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';
import { hashPassword } from './lib/password-hash';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService
  ) {}

  async createUser(dto: CreateUserDto) {
    const email = dto.email.trim().toLowerCase();

    const existingUser = await this.prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new RpcException({
        status: 'error',
        message: 'Email already registered',
        statusCode: 409,
      });
    }

    const hashedPassword = await hashPassword(dto.password);

    try {
      const savedUser = await this.prisma.users.create({
        data: {
          firstName: dto.firstName?.trim(),
          lastName: dto.lastName?.trim(),
          email,
          password: hashedPassword,
          address: dto.address?.trim(),
          roles: ['user'],
          tokenVersion: 0,
        },
      });

      const tokens = await this.authService.generateTokens(savedUser);

      return {
        user: {
          id: savedUser.id,
          email: savedUser.email,
          roles: savedUser.roles,
        },
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenType: tokens.token_type,
      };
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new RpcException({
          status: 'error',
          message: 'Email already taken',
          statusCode: 409,
        });
      }
      throw error;
    }
  }
}
