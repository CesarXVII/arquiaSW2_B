import {
  Module
} from '@nestjs/common';
import {
  TypeOrmModule
} from '@nestjs/typeorm';

import {
  Usuario
} from './usuario.entity';
import {
  UsuariosService
} from './usuario.service';
import {
  UsuarioController
} from './usuario.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  controllers: [UsuarioController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuarioModule {}