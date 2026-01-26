import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersEntity } from './entity/UsersEntity';
import { CreateUserDto } from './dto/create-user.dto';
import { hashPassword } from './lib/password-hash';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    private readonly authService: AuthService
  ) {}

  async createUser(dto: CreateUserDto) {
    const email = dto.email.trim().toLowerCase();

    const existingUser = await this.usersRepository.findOne({
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

    const user = this.usersRepository.create({
      firstName: dto.firstName?.trim(),
      lastName: dto.lastName?.trim(),
      email,
      password: hashedPassword,
      address: dto.address?.trim(),
      roles: ['user'],
      tokenVersion: 0,
    });

    const savedUser = await this.usersRepository.save(user);

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
  }
}
