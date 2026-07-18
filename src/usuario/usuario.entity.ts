import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Proyecto } from '../proyecto/proyecto.entity';
import { Colaborativo } from '../colaborativo/colaborativo.entity';
import { Tarjeta } from '../tarjeta/tarjeta.entity';
import { Pago } from '../pago/pago.entity';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  apellidoM: string;

  @Column()
  apellidoP: string;

  @Column()
  password: string;

  @Column({
    unique: true
  })
  correo: string;

  @Column({
    type: 'date'
  })
  fechaNacimiento: Date;

  @Column()
  nombre: string;

  @Column({
    length: 1
  })
  sigla: string;

  @Column()
  color: string;

  @Column({
    default: 'Básico'
  })
  plan: string;

  @CreateDateColumn({
    type: 'timestamp'
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp'
  })
  updatedAt: Date;

  @OneToMany(() => Proyecto, (proyecto) => proyecto.usuarioDueno)
  proyectosCreados: Proyecto[];

  @OneToMany(() => Colaborativo, (colaboracion) => colaboracion.usuario)
  colaboraciones: Colaborativo[];

  @OneToMany(() => Tarjeta, (tarjeta) => tarjeta.usuario)
  tarjetas: Tarjeta[];

  @OneToMany(() => Pago, (pago) => pago.usuario)
  pagos: Pago[];

  @Column({ default: false })
  acceptedTerms: boolean;
}