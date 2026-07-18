import { IsString, IsEmail, MinLength, IsDateString, IsNotEmpty, IsBoolean, Equals } from 'class-validator';

export class RegisterUsuarioDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  apellidoM: string;

  @IsNotEmpty()
  @IsString()
  apellidoP: string;

  @IsEmail()
  correo: string;

  @MinLength(6, {
    message: 'La contraseña debe tener al menos 6 caracteres'
  })
  @IsString()
  password: string;

  @IsDateString()
  fechaNacimiento: Date;

  @IsNotEmpty()
  @IsBoolean()
  @Equals(true, { message: 'Debe aceptar los términos y condiciones' })
  acceptedTerms: boolean;
}