import {
  Module
} from '@nestjs/common';
import {
  TypeOrmModule
} from '@nestjs/typeorm';
import {
  Plantilla
} from './plantilla.entity';
import {
  PlantillaService
} from './plantilla.service';
import {
  PlantillaController
} from './plantilla.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Plantilla])],
  providers: [PlantillaService],
  controllers: [PlantillaController],
})
export class PlantillaModule {}