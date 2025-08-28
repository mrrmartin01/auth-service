import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/Register.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('registerUser')
  register(data: RegisterDto) {
    return this.authService.register(data);
  }

  @MessagePattern('loginUser')
  login(data: { email: string; password: string }) {
    return this.authService.login(data);
  }
}
