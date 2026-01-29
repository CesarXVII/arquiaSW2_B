import {
  Injectable,
  BadRequestException
} from '@nestjs/common';
import {
  Repository
} from 'typeorm';
import {
  InjectRepository
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
  CreatePagoDto
} from './pago.dto';

@Injectable()
export class PagoService {
  constructor(
    @InjectRepository(Pago) private readonly pagoRepo: Repository < Pago > ,
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository < Usuario > ,
    @InjectRepository(Tarjeta) private readonly tarjetaRepo: Repository < Tarjeta > ,
  ) {}

  async registrarPago(data: CreatePagoDto) {
    const usuario = await this.usuarioRepo.findOne({
      where: {
        id: data.usuarioId
      }
    });
    if (!usuario) throw new BadRequestException('Usuario no existe');

    const tarjeta = await this.tarjetaRepo.findOne({
      where: {
        id: data.tarjetaId
      }
    });
    if (!tarjeta) throw new BadRequestException('Tarjeta no existe');

    const pago = this.pagoRepo.create({
      usuario,
      tarjeta,
      monto: data.monto,
      moneda: data.moneda.toUpperCase(),
      estado: 'Pagado',
    });

    await this.pagoRepo.save(pago);
  }

  async obtenerPagosPorUsuario(usuarioId: number) {
    return this.pagoRepo.find({
      where: {
        usuario: {
          id: usuarioId
        }
      },
      order: {
        createdAt: 'DESC'
      },
      relations: [],
    });
  }
}