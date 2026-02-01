import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';
import { hashPassword } from './lib/password-hash';
import { AuthService } from '../auth/auth.service';
import { User } from './entity/Users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authService: AuthService
  ) {}

  async createUser(dto: CreateUserDto) {
    const email = dto.email.trim().toLowerCase();

    const existingUser = await this.userRepository.findOne({
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
      const newUser = this.userRepository.create({
        firstName: dto.firstName?.trim(),
        lastName: dto.lastName?.trim(),
        email,
        password: hashedPassword,
        address: dto.address?.trim(),
        roles: ['user'],
        tokenVersion: 0,
      });

      const savedUser = await this.userRepository.save(newUser);

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
        error instanceof Object &&
        'code' in error &&
        (error as Record<string, unknown>).code === '23505'
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
