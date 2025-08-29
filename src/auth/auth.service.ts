import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/typeorm/entities/Users';
import { Repository } from 'typeorm';
import * as argon from 'argon2';
import { RpcException } from '@nestjs/microservices';
import { RegisterDto } from './dtos/Register.dto';
import { LoginDto } from './dtos/login.dto';

// users-microservice/auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (!user || !(await argon.verify(user.password, dto.password))) {
      throw new RpcException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, roles: user.role };
    return { access_token: this.jwtService.sign(payload) };
  }

  async register(dto: RegisterDto) {
    const hashed = await argon.hash(dto.password);
    const user = this.usersRepo.create({ ...dto, password: hashed });
    await this.usersRepo.save(user);
    return user;
  }
}
