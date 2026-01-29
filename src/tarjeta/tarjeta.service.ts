import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  InjectRepository
} from '@nestjs/typeorm';
import {
  Repository
} from 'typeorm';
import {
  Tarjeta
} from './tarjeta.entity';
import {
  CreateTarjetaDto
} from './dto/tarjeta.dto';
import {
  Usuario
} from '../usuario/usuario.entity';

@Injectable()
export class TarjetaService {
  constructor(
    @InjectRepository(Tarjeta)
    private readonly tarjetaRepository: Repository < Tarjeta > ,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository < Usuario > ,
  ) {}

  private readonly tarjetasValidas = [{
    marca: 'visa',
    numero: '4242424242424242'
  }, {
    marca: 'mastercard',
    numero: '5555555555554444'
  }, {
    marca: 'amex',
    numero: '378282246310005'
  }, {
    marca: 'discover',
    numero: '6011111111111117'
  }, {
    marca: 'diners',
    numero: '30569309025904'
  }, {
    marca: 'jcb',
    numero: '3566002020360505'
  }, ];

  private generarStripeId(): string {
    const random = Math.random().toString(36).substring(2, 18);
    return `card_${random}`;
  }

  async registrarTarjeta(createTarjetaDto: CreateTarjetaDto): Promise < Tarjeta > {
    const usuario = await this.usuarioRepository.findOneBy({
      id: createTarjetaDto.usuarioId
    });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const numeroIngresado = createTarjetaDto.numero.replace(/\s+/g, '');
    const marcaIngresada = createTarjetaDto.marca.toLowerCase();

    const tarjetaValida = this.tarjetasValidas.find(
      (t) => t.numero === numeroIngresado && t.marca === marcaIngresada,
    );

    if (!tarjetaValida) {
      throw new BadRequestException('Tarjeta no válida para sandbox de Stripe');
    }

    const stripeId = this.generarStripeId();

    const tarjeta = this.tarjetaRepository.create({
      ...createTarjetaDto,
      stripeId,
      ultimos4: numeroIngresado.slice(-4),
      usuario,
    });

    return this.tarjetaRepository.save(tarjeta);
  }

  async obtenerTarjetas(usuarioId: number): Promise < Partial < Tarjeta > [] > {
    return this.tarjetaRepository.find({
      where: {
        usuario: {
          id: usuarioId
        }
      },
      select: [
        'id',
        'stripeId',
        'ultimos4',
        'marca',
        'tipo',
        'expMes',
        'expAno',
        'nombrePropietario',
        'direccion',
        'createdAt',
      ],
    });
  }

  async eliminarTarjeta(id: number): Promise < {
    message: string
  } > {
    const tarjeta = await this.tarjetaRepository.findOneBy({
      id
    });
    if (!tarjeta) {
      throw new NotFoundException('Tarjeta no encontrada');
    }

    await this.tarjetaRepository.delete(id);
    return {
      message: 'Tarjeta eliminada correctamente'
    };
  }
}