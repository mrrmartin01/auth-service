import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //create user
  @MessagePattern({ cmd: 'create_user' })
  async createUser(@Payload() userDto: CreateUserDto) {
    return this.usersService.createUser(userDto);
  }
}
