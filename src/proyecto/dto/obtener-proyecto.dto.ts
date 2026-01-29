import {
  IsNumber
} from 'class-validator';

export class ObtenerProyectoDto {
  @IsNumber()
  idProyecto: number;
}