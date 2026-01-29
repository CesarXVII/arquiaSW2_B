import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('plantilla')
export class Plantilla {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column('json')
  contenido_json: any;

  @Column('text')
  imagen_base64: string;

  @Column('decimal', {
    precision: 10,
    scale: 2
  })
  precio: number;

  @CreateDateColumn({
    type: 'timestamp'
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp'
  })
  updatedAt: Date;
}