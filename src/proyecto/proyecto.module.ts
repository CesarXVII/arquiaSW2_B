import {
  Module
} from '@nestjs/common';
import {
  TypeOrmModule
} from '@nestjs/typeorm';

import {
  Proyecto
} from './proyecto.entity';
import {
  ProyectoShareLink
} from './proyecto-share-link.entity';
import {
  Colaborativo
} from '../colaborativo/colaborativo.entity';
import {
  Usuario
} from '../usuario/usuario.entity';

import {
  ProyectoService
} from './proyecto.service';
import {
  ProyectoController
} from './proyecto.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Proyecto,
      ProyectoShareLink,
      Colaborativo,
      Usuario,
    ]),
  ],
  providers: [ProyectoService],
  controllers: [ProyectoController],
})
export class ProyectoModule {}