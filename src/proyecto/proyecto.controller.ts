import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Patch,
} from '@nestjs/common';
import {
  ProyectoService
} from './proyecto.service';
import {
  ObtenerProyectoDto
} from './dto/obtener-proyecto.dto';
import {
  GuardarPlanoDto
} from './dto/guardar-plano.dto';
import {
  CrearProyectoDto
} from './dto/crear-proyecto.dto';

@Controller('proyecto')
export class ProyectoController {
  constructor(private readonly proyectoService: ProyectoService) {}

  @Post('obtener-todos-proyectos')
  obtenerProyectos() {
    return this.proyectoService.obtenerTodosLosProyectos();
  }

  @Post('obtener-proyecto')
  obtenerProyecto(@Body() dto: ObtenerProyectoDto) {
    return this.proyectoService.obtenerProyectoPorId(dto.idProyecto);
  }

  @Post('guardar')
  guardarPlano(@Body() dto: GuardarPlanoDto) {
    return this.proyectoService.guardarPlano(dto);
  }

  @Post('crear')
  crearProyecto(@Body() dto: CrearProyectoDto) {
    return this.proyectoService.crearProyecto(dto);
  }

  @Post(':id/share-link')
  crearLink(
    @Param('id') proyectoId: string,
    @Body() body: any,
  ) {
    return this.proyectoService.crearShareLink(
      Number(proyectoId),
      body.permission,
      body.expiresInDays,
    );
  }

  @Patch(':id/share-link/disable')
  desactivarLinks(@Param('id') id: string) {
    return this.proyectoService.desactivarShareLinks(Number(id));
  }

  @Get('share/:token')
  abrirDesdeLink(@Param('token') token: string) {
    return this.proyectoService.obtenerProyectoPorToken(token);
  }
}