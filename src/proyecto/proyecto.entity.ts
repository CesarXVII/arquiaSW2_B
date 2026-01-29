import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import {
  Colaborativo
} from '../colaborativo/colaborativo.entity';
import {
  ProyectoShareLink
} from './proyecto-share-link.entity';
import {
  Usuario
} from '../usuario/usuario.entity';

@Entity('proyecto')
export class Proyecto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({
    type: 'jsonb',
    default: {}
  })
  contenidoJson: object;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at'
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at'
  })
  updatedAt: Date;

  @ManyToOne(() => Usuario, (usuario) => usuario.proyectosCreados, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'usuarioId'
  })
  usuarioDueno: Usuario | null;

  @OneToMany(() => Colaborativo, (c) => c.proyecto)
  colaboradores: Colaborativo[];

  @OneToMany(() => ProyectoShareLink, (link) => link.proyecto)
  shareLinks: ProyectoShareLink[];
}