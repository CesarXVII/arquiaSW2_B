import {
  Module
} from '@nestjs/common';
import {
  TypeOrmModule
} from '@nestjs/typeorm';
import {
  Tarjeta
} from './tarjeta.entity';
import {
  TarjetaService
} from './tarjeta.service';
import {
  TarjetaController
} from './tarjeta.controller';
import {
  Usuario
} from '../usuario/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tarjeta, Usuario])],
  providers: [TarjetaService],
  controllers: [TarjetaController],
})
export class TarjetaModule {}