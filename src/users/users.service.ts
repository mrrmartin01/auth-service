import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UsersEntity } from './entity/UsersEntity';
import { CreateUserDto } from './dto/create-user.dto';
import { hashPassword } from './lib/password-hash';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>
  ) {}

  async createUser(dto: CreateUserDto): Promise<UsersEntity> {
    const email = dto.email.trim().toLowerCase();

    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await hashPassword(dto.password);

    const user = this.usersRepository.create({
      firstName: dto.firstName?.trim(),
      lastName: dto.lastName?.trim(),
      email,
      password: hashedPassword,
      address: dto.address?.trim(),
    });

    try {
      console.log('Saving user:', user);
      return await this.usersRepository.save(user);
    } catch (err: unknown) {
      throw new InternalServerErrorException(
        'Failed to create user',
        err instanceof Error ? { cause: err } : undefined
      );
    }
  }
}
