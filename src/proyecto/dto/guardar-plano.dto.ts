import {
  IsNumber,
  IsObject
} from 'class-validator';

export class GuardarPlanoDto {
  @IsNumber()
  idProyecto: number;

  @IsObject()
  contenidoJson: object;
}