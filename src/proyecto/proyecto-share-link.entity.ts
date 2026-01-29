import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  Proyecto
} from './proyecto.entity';

@Entity('proyecto_share_links')
export class ProyectoShareLink {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  proyecto_id: number;

  @ManyToOne(() => Proyecto, (p) => p.shareLinks, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'proyecto_id'
  })
  proyecto: Proyecto;

  @Column({
    type: 'uuid',
    unique: true
  })
  token: string;

  @Column({
    type: 'varchar',
    length: 10
  })
  permission: 'read' | 'write';

  @Column({
    type: 'timestamp',
    nullable: true
  })
  expires_at: Date | null;

  @Column({
    default: true
  })
  is_active: boolean;

  @CreateDateColumn({
    name: 'created_at'
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at'
  })
  updatedAt: Date;
}