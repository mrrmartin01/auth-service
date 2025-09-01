import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { EditUserDto } from './dtos/EditUser.dto';

@Controller()
export class UsersMicroserviceController {
  constructor(private usersService: UsersService) {}
  @MessagePattern({ cmd: 'editUser' })
  editUser(userId: string, @Payload() editUserDto: EditUserDto) {
    return this.usersService.editUser(userId, editUserDto);
  }
  @EventPattern('paymentCreated')
  paymentCreated(@Payload() data: any) {
    console.log('Payment created event received:', data);
  }
}
