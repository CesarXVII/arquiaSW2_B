import {
  Injectable,
  NotFoundException
} from '@nestjs/common';
import {
  InjectRepository
} from '@nestjs/typeorm';
import {
  Repository
} from 'typeorm';
import {
  Plantilla
} from './plantilla.entity';
import {
  CrearPlantillaDto
} from './plantilla.dto';

@Injectable()
export class PlantillaService {
  constructor(
    @InjectRepository(Plantilla)
    private readonly plantillaRepository: Repository < Plantilla > ,
  ) {}

  async registrarPlantilla(crearPlantillaDto: CrearPlantillaDto): Promise < {
    message: string
  } > {
    const plantilla = this.plantillaRepository.create(crearPlantillaDto);
    await this.plantillaRepository.save(plantilla);
    return {
      message: 'Plantilla creada correctamente'
    };
  }

  async obtenerTodasPlantillas(): Promise < Plantilla[] > {
    return this.plantillaRepository.find();
  }

  async obtenerTodasPlantillasResumen(): Promise < {
    id: number;
    nombre: string;
  } [] > {
    return this.plantillaRepository.find({
      select: ['id', 'nombre']
    });
  }

  async eliminarPlantilla(id: number): Promise < {
    message: string
  } > {
    const result = await this.plantillaRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`La plantilla con id ${id} no existe`);
    }
    return {
      message: 'Plantilla eliminada correctamente'
    };
  }
}