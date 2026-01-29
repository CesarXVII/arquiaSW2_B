import {
  IsNumber
} from 'class-validator';

export class ObtenerProyectosDto {
  @IsNumber()
  idUsuario: number;
}