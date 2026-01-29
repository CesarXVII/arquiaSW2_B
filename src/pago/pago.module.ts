import {
  Module
} from '@nestjs/common';
import {
  TypeOrmModule
} from '@nestjs/typeorm';
import {
  Pago
} from './pago.entity';
import {
  Usuario
} from '../usuario/usuario.entity';
import {
  Tarjeta
} from '../tarjeta/tarjeta.entity';
import {
  PagoService
} from './pago.service';
import {
  PagoController
} from './pago.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pago, Usuario, Tarjeta])],
  controllers: [PagoController],
  providers: [PagoService],
})
export class PagoModule {}