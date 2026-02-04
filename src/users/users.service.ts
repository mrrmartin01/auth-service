import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';
import { hashPassword, verifyPassword } from './lib/password-hash';
import { AuthService } from '../auth/auth.service';
import { User } from './entity/Users.entity';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authService: AuthService
  ) {}

  async createUser(dto: CreateUserDto) {
    const email = dto.email.trim().toLowerCase();

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
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenType: tokens.tokenType,
      };
    } catch (error) {
      if (
        error instanceof Object &&
        'code' in error &&
        (error as Record<string, unknown>).code === '23505'
      ) {
        throw new RpcException({
          status: 'error',
          message: 'Email already registered',
          statusCode: 409,
        });
      }
      throw error;
    }
  }

  async loginUser(dto: LoginUserDto) {
    const email = dto.email?.trim().toLowerCase();

    if (!email || !dto.password) {
      throw new RpcException({
        status: 'error',
        message: 'Please provide the required fields',
        statusCode: 400,
      });
    }

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new RpcException({
        status: 'error',
        message: 'Invalid email or password',
        statusCode: 401,
      });
    }

    const isPasswordValid = await verifyPassword(user.password, dto.password);

    if (!isPasswordValid) {
      throw new RpcException({
        status: 'error',
        message: 'Invalid email or password',
        statusCode: 401,
      });
    }

    const tokens = await this.authService.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenType: tokens.tokenType,
    };
  }

  async updateUser(id: string, updateData: Partial<CreateUserDto>) {
    if (!id) {
      throw new RpcException({
        status: 'error',
        message: 'User ID is required',
        statusCode: 400,
      });
    }

    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new RpcException({
        status: 'error',
        message: 'User not found',
        statusCode: 404,
      });
    }

    if (updateData.email) {
      updateData.email = updateData.email.trim().toLowerCase();
    }
    if (updateData.firstName) {
      updateData.firstName = updateData.firstName.trim();
    }
    if (updateData.lastName) {
      updateData.lastName = updateData.lastName.trim();
    }
    if (updateData.address) {
      updateData.address = updateData.address.trim();
    }
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }

    Object.assign(user, updateData);

    const updatedUser = await this.userRepository.save(user);
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      address: updatedUser.address,
      roles: updatedUser.roles,
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new RpcException({
        status: 'error',
        message: 'User not found',
        statusCode: 404,
      });
    }

    const newAccessToken = this.authService.generateAccessToken(user);

    const newRefreshToken = await this.authService.rotateRefreshToken(
      user.id,
      refreshToken
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      tokenType: 'Bearer',
    };
  }
}
