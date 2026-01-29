import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import {
  InjectRepository
} from '@nestjs/typeorm';
import {
  Repository
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import {
  ConfigService
} from '@nestjs/config';

import {
  Usuario
} from './usuario.entity';
import {
  RegisterUsuarioDto
} from './dto/register-usuario.dto';
import {
  LoginUsuarioDto
} from './dto/login-usuario.dto';
import {
  ResetPasswordDto
} from './dto/reset-password.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly configService: ConfigService,
  ) {}

  private readonly COLORES = [
    '#cc630d',
    '#3c65eb',
    '#28a745',
    '#d63384',
    '#fd7e14',
    '#6f42c1',
    '#20c997',
    '#e83e8c',
    '#0dcaf0',
    '#ffc107',
    '#FF0000',
    '#DC143C',
    '#FF1493',
    '#FFC0CB',
    '#FA8072',
    '#FFA500',
    '#FFD700',
    '#FFFF00',
    '#DAA520',
    '#FF4500',
    '#008000',
    '#7CFC00',
    '#3CB371',
    '#006400',
    '#90EE90',
    '#0000FF',
    '#1E90FF',
    '#4169E1',
    '#87CEEB',
    '#00BFFF',
    '#800080',
    '#9370DB',
    '#4B0082',
    '#DDA0DD',
    '#EE82EE',
    '#A52A2A',
    '#D2B48C',
    '#CD853F',
    '#808000',
    '#5F9EA0',
    '#000000',
    '#808080',
    '#A9A9A9',
    '#D3D3D3',
    '#C0C0C0',
    '#00FFFF',
    '#FF00FF',
    '#7FFFD4',
    '#00FF00',
    '#6A5ACD',
  ];

  async findOne(id: number): Promise < Usuario | null > {
    return this.usuarioRepository.findOneBy({
      id
    });
  }

  async findOneByCorreo(correo: string): Promise < Usuario | null > {
    return this.usuarioRepository.findOneBy({
      correo
    });
  }

  async register(registerDto: RegisterUsuarioDto) {
    const {
      correo,
      password,
      apellidoP,
      ...rest
    } = registerDto;

    const existingUser = await this.findOneByCorreo(correo);
    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const sigla = apellidoP.charAt(0).toUpperCase();
    const color = this.COLORES[Math.floor(Math.random() * this.COLORES.length)];

    const newUser = this.usuarioRepository.create({
      ...rest,
      correo,
      password: hashedPassword,
      apellidoP,
      sigla,
      color,
    });

    const user = await this.usuarioRepository.save(newUser);
    const {
      password: _,
      ...userClean
    } = user;
    return userClean;
  }

  async login(loginDto: LoginUsuarioDto) {
    const {
      correo,
      password
    } = loginDto;

    const user = await this.findOneByCorreo(correo);
    if (!user) throw new UnauthorizedException('Correo incorrecto.');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new UnauthorizedException('Contraseña incorrecta.');

    return {
      id: user.id,
      nombre: `${user.nombre} ${user.apellidoP ?? ''} ${user.apellidoM ?? ''}`.trim(),
      correo: user.correo,
      sigla: user.sigla,
      color: user.color,
      plan: user.plan,
    };
  }

  private generarPasswordSegura(): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
    return Array.from({
      length: 12
    }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  private async sendPasswordEmail(destino: string, nuevaPass: string) {
    const transporter = nodemailer.createTransport({
      host: this.configService.get < string > ('MAIL_HOST'),
      port: Number(this.configService.get < number > ('MAIL_PORT')),
      secure: false,
      auth: {
        user: this.configService.get < string > ('MAIL_USER'),
        pass: this.configService.get < string > ('MAIL_PASS'),
      },
    });

    await transporter.sendMail({
      from: this.configService.get < string > ('MAIL_USER'),
      to: destino,
      subject: 'Recuperación de contraseña - Diagramador Inteligente',
      text: `Hola 👋,

Tu nueva contraseña es: ${nuevaPass}

Por seguridad, cámbiala después de iniciar sesión.

Saludos,
Equipo Diagramador Inteligente.`,
    });
  }

  async resetPasswordPorCorreo(dto: ResetPasswordDto) {
    const usuario = await this.findOneByCorreo(dto.correo);
    if (!usuario) {
      throw new BadRequestException('El correo no está registrado ❌');
    }

    const nuevaPassword = this.generarPasswordSegura();
    usuario.password = await bcrypt.hash(nuevaPassword, 10);

    await this.usuarioRepository.save(usuario);
    await this.sendPasswordEmail(usuario.correo, nuevaPassword);

    return {
      mensaje: 'Nueva contraseña enviada al correo ✅'
    };
  }

  async obtenerPlan(id: number) {
    const usuario = await this.findOne(id);
    if (!usuario) throw new BadRequestException('Usuario no encontrado');

    return {
      plan: usuario.plan
    };
  }

  async modificarPlan(id: number, nuevoPlan: string) {
    const usuario = await this.findOne(id);
    if (!usuario) throw new BadRequestException('Usuario no encontrado');

    usuario.plan = nuevoPlan;
    await this.usuarioRepository.save(usuario);

    return {
      mensaje: 'Plan actualizado correctamente',
      plan: usuario.plan
    };
  }
}