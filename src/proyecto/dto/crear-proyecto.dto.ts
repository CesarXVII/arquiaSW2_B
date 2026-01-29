import {
  IsNumber,
  IsString
} from 'class-validator';

export class CrearProyectoDto {
  @IsString()
  nombre: string;

  @IsNumber()
  idUsuario: number;
}