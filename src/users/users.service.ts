import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/typeorm/entities/Users';
import { EditUserDto } from './dtos/EditUser.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) {}

  async editUser(userId: string, editUserDto: EditUserDto): Promise<User> {
    if (!editUserDto || Object.keys(editUserDto).length === 0) {
      throw new BadRequestException('No update fields provided');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    Object.assign(user, editUserDto);

    const updatedUser = await this.userRepository.save(user);

    return updatedUser;
  }
}
