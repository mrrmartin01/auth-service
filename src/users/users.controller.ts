import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //create user
  @MessagePattern({ cmd: 'create_user' })
  async createUser(@Payload() userDto: CreateUserDto) {
    return await this.usersService.createUser(userDto);
  }

  //login user
  @MessagePattern({ cmd: 'login_user' })
  async loginUser(@Payload() loginDto: LoginUserDto) {
    return await this.usersService.loginUser(loginDto);
  }

  //update user
  @MessagePattern({ cmd: 'update_user' })
  async updateUser(@Payload() data: { id: string; [key: string]: any }) {
    const { id, ...updateData } = data;
    return await this.usersService.updateUser(id, updateData);
  }

  //refresh token
  @MessagePattern({ cmd: 'refresh_access_token' })
  async refreshToken(
    @Payload()
    payload: {
      userId: string;
      refreshToken: string;
    }
  ) {
    return this.usersService.refreshTokens(
      payload.userId,
      payload.refreshToken
    );
  }
}
