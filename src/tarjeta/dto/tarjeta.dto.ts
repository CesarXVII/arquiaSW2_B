export class CreateTarjetaDto {
  readonly numero: string;
  readonly marca: string;
  readonly tipo: string;
  readonly expMes: number;
  readonly expAno: number;
  readonly cvc: string;
  readonly usuarioId: number;
  readonly nombrePropietario: string;
  readonly direccion: string;
}