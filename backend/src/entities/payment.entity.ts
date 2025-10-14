import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Elder } from './elder.entity';
import { User } from './user.entity';

@Entity('Payments')
export class Payment {
  @PrimaryGeneratedColumn({ name: 'payment_id' })
  paymentId: number;

  @Column({ name: 'elder_id' })
  elderId: number;

  @ManyToOne(() => Elder)
  @JoinColumn({ name: 'elder_id' })
  elder: Elder;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  service: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  amount: number;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  method: string;

  @Column({ type: 'nvarchar', length: 20, default: 'Pending' })
  status: string;

  @Column({ name: 'paid_by', nullable: true })
  paidBy: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'paid_by' })
  payer: User;

  @Column({ name: 'created_at', type: 'datetime', default: () => 'GETDATE()' })
  createdAt: Date;
}