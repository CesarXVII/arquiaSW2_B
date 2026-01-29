import {
  Controller,
  Post,
  Body
} from '@nestjs/common';
import {
  TarjetaService
} from './tarjeta.service';
import {
  CreateTarjetaDto
} from './dto/tarjeta.dto';

@Controller('tarjetas')
export class TarjetaController {
  constructor(private readonly tarjetaService: TarjetaService) {}

  @Post('registrar')
  async registrar(@Body() createTarjetaDto: CreateTarjetaDto): Promise < {
    message: string
  } > {
    await this.tarjetaService.registrarTarjeta(createTarjetaDto);
    return {
      message: 'Tarjeta registrada correctamente'
    };
  }

  @Post('obtener_tarjetas')
  async obtenerTarjetas(@Body('usuarioId') usuarioId: number) {
    return this.tarjetaService.obtenerTarjetas(usuarioId);
  }

  @Post('eliminar')
  async eliminarTarjeta(@Body('id') id: number) {
    return this.tarjetaService.eliminarTarjeta(id);
  }
}