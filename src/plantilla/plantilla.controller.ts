import {
  Controller,
  Get,
  Post,
  Body
} from '@nestjs/common';
import {
  PlantillaService
} from './plantilla.service';

@Controller('plantilla')
export class PlantillaController {
  constructor(private readonly plantillaService: PlantillaService) {}

  @Post('registrar')
  registrarPlantilla(@Body() crearPlantillaDto: any): Promise < {
    message: string
  } > {
    return this.plantillaService.registrarPlantilla(crearPlantillaDto);
  }

  @Get('todas')
  obtenerTodasPlantillas() {
    return this.plantillaService.obtenerTodasPlantillas();
  }

  @Get('resumen')
  obtenerTodasPlantillasResumen() {
    return this.plantillaService.obtenerTodasPlantillasResumen();
  }

  @Post('delete')
  eliminarPlantilla(@Body('id') id: number): Promise < {
    message: string
  } > {
    return this.plantillaService.eliminarPlantilla(id);
  }
}