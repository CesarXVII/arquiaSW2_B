import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  Usuario
} from '../usuario/usuario.entity';

@Entity('tarjeta')
export class Tarjeta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true
  })
  stripeId: string;

  @Column({
    length: 4
  })
  ultimos4: string;

  @Column()
  marca: string;

  @Column()
  tipo: string;

  @Column()
  expMes: number;

  @Column()
  expAno: number;

  @Column({
    length: 3
  })
  cvc: string;

  @Column({
    default: 'Desconocido'
  })
  nombrePropietario: string;

  @Column({
    default: 'Sin direccion'
  })
  direccion: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.tarjetas)
  usuario: Usuario;

  @CreateDateColumn({
    type: 'timestamp'
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp'
  })
  updatedAt: Date;
}