import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginUsuarioDto {
  @IsEmail()
  correo: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}