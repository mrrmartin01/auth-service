import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { EditUserDto } from './dtos/EditUser.dto';

@Controller()
export class UsersMicroserviceController {
  constructor(private usersService: UsersService) {}

  @MessagePattern({ cmd: 'getMe' })
  getMe(@Payload() data: { userId: string }) {
    return this.usersService.getMe(data.userId);
  }

  @MessagePattern({ cmd: 'editUser' })
  editUser(@Payload() data: { userId: string; editUserDto: EditUserDto }) {
    return this.usersService.editUser(data.userId, data.editUserDto);
  }

  @EventPattern('paymentCreated')
  paymentCreated(@Payload() data: any) {
    console.log('Payment created event received:', data);
  }
}
