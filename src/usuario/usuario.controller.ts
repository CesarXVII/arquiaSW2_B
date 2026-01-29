import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { UsuariosService } from './usuario.service';
import { RegisterUsuarioDto } from './dto/register-usuario.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerDto: RegisterUsuarioDto) {
    return this.usuariosService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginUsuarioDto) {
    return this.usuariosService.login(loginDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.usuariosService.resetPasswordPorCorreo(dto);
  }

  @Post('plan')
  @HttpCode(HttpStatus.OK)
  obtenerPlan(@Body('id') id: number) {
    return this.usuariosService.obtenerPlan(id);
  }

  @Put('modificar_plan')
  @HttpCode(HttpStatus.OK)
  modificarPlan(
    @Body('id') id: number,
    @Body('plan') nuevoPlan: string,
  ) {
    return this.usuariosService.modificarPlan(id, nuevoPlan);
  }
}