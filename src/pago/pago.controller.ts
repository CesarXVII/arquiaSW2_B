import {
  Controller,
  Post,
  Body
} from '@nestjs/common';
import {
  PagoService
} from './pago.service';
import {
  CreatePagoDto
} from './pago.dto';

@Controller('pago')
export class PagoController {
  constructor(private readonly pagoService: PagoService) {}

  @Post('registrar')
  async registrar(@Body() body: CreatePagoDto) {
    await this.pagoService.registrarPago(body);
    return {
      message: 'Pago realizado con éxito'
    };
  }

  @Post('obtener_pagos')
  async obtener(@Body('usuarioId') usuarioId: number) {
    return this.pagoService.obtenerPagosPorUsuario(usuarioId);
  }
}