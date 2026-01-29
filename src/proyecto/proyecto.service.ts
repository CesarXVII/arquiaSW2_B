import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  InjectRepository
} from '@nestjs/typeorm';
import {
  Repository
} from 'typeorm';

import {
  Proyecto
} from './proyecto.entity';
import {
  Colaborativo
} from '../colaborativo/colaborativo.entity';
import {
  ProyectoShareLink
} from './proyecto-share-link.entity';

import {
  CrearProyectoDto
} from './dto/crear-proyecto.dto';
import {
  GuardarPlanoDto
} from './dto/guardar-plano.dto';

import {
  v4 as uuidv4
} from 'uuid';

@Injectable()
export class ProyectoService {
  constructor(
    @InjectRepository(Proyecto)
    private readonly proyectoRepository: Repository < Proyecto > ,

    @InjectRepository(Colaborativo)
    private readonly colaborativoRepo: Repository < Colaborativo > ,

    @InjectRepository(ProyectoShareLink)
    private readonly shareLinkRepo: Repository < ProyectoShareLink > ,
  ) {}

  async crearProyecto(dto: CrearProyectoDto) {
    const nuevo = this.proyectoRepository.create({
      nombre: dto.nombre,
      contenidoJson: {},
    });

    return this.proyectoRepository.save(nuevo);
  }

  async obtenerTodosLosProyectos() {
    return this.proyectoRepository.find({
      select: ['id', 'nombre', 'createdAt'],
      order: {
        createdAt: 'DESC'
      },
    });
  }

  async obtenerProyectoPorId(idProyecto: number) {
    const proyecto = this.proyectoRepository.findOne({
      where: {
        id: idProyecto
      },
    });

    if (!proyecto) throw new NotFoundException('Proyecto no encontrado');
    return proyecto;
  }

  async guardarPlano(body: GuardarPlanoDto) {
    const proyecto = await this.proyectoRepository.findOne({
      where: {
        id: body.idProyecto
      },
    });
    if (!proyecto) throw new NotFoundException('Proyecto no encontrado');

    proyecto.contenidoJson = body.contenidoJson;
    await this.proyectoRepository.save(proyecto);

    return {
      message: 'Plano guardado con éxito'
    };
  }

  async crearShareLink(
    proyectoId: number,
    permission: 'read' | 'write',
    expiresInDays ? : number,
  ) {
    const token = uuidv4();

    let expires_at: Date | null = null;
    if (expiresInDays) {
      expires_at = new Date();
      expires_at.setDate(expires_at.getDate() + expiresInDays);
    }

    const link = this.shareLinkRepo.create({
      proyecto_id: proyectoId,
      token,
      permission,
      expires_at,
      is_active: true,
    });

    await this.shareLinkRepo.save(link);

    return {
      shareUrl: `${process.env.FRONTEND_URL}/share/${token}`,
      permission,
      expires_at,
    };
  }

  async desactivarShareLinks(proyectoId: number) {
    await this.shareLinkRepo.update({
      proyecto_id: proyectoId
    }, {
      is_active: false
    }, );

    return {
      ok: true
    };
  }

  async obtenerProyectoPorToken(token: string) {
    const link = await this.shareLinkRepo.findOne({
      where: {
        token
      },
      relations: ['proyecto'],
    });

    if (!link || !link.is_active) {
      throw new ForbiddenException('Link inválido');
    }

    if (link.expires_at && link.expires_at < new Date()) {
      throw new ForbiddenException('Link expirado');
    }

    return {
      proyecto: link.proyecto,
      permission: link.permission,
    };
  }
}