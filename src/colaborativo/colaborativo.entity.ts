import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  Usuario
} from '../usuario/usuario.entity';
import {
  Proyecto
} from '../proyecto/proyecto.entity';

@Entity('colaborativo')
export class Colaborativo {
  @PrimaryColumn({
    name: 'usuario_id'
  })
  usuarioId: number;

  @PrimaryColumn({
    name: 'proyecto_id'
  })
  proyectoId: number;

  @Column({
    default: true
  })
  usuarioActivo: boolean;

  @Column({
    type: 'varchar',
    length: 10,
    default: 'owner',
  })
  role: 'owner' | 'editor' | 'viewer';

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

  @ManyToOne(() => Usuario)
  @JoinColumn({
    name: 'usuario_id'
  })
  usuario: Usuario;

  @ManyToOne(() => Proyecto)
  @JoinColumn({
    name: 'proyecto_id'
  })
  proyecto: Proyecto;
}