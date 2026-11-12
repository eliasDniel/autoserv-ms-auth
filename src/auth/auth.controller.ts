import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.health')
  health() {
    return this.authService.health();
  }

  @MessagePattern('auth.user.list')
  listUsers() {
    return this.authService.listUsers();
  }

  @MessagePattern('auth.user.create')
  createUser(@Payload() dto: CreateUserDto) {
    return this.authService.createUser(dto);
  }

  @MessagePattern('auth.user.update')
  updateUser(@Payload() dto: { id: number } & import('./dto/update-user.dto').UpdateUserDto) {
    const { id, ...data } = dto;
    return this.authService.updateUser(id, data);
  }

  @MessagePattern('auth.login')
  login(@Payload() dto: LoginUserDto) {
    return this.authService.login(dto);
  }
}
