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
import {
  Tarjeta
} from '../tarjeta/tarjeta.entity';

@Entity('pago')
export class Pago {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.pagos)
  usuario: Usuario;

  @ManyToOne(() => Tarjeta, (tarjeta) => tarjeta)
  tarjeta: Tarjeta;

  @Column()
  monto: number;

  @Column()
  moneda: string;

  @Column({
    default: 'pendiente'
  })
  estado: string;

  @CreateDateColumn({
    type: 'timestamp'
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp'
  })
  updatedAt: Date;
}