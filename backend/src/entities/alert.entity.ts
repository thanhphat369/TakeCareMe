import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Elder } from './elder.entity';
import { User } from './user.entity';

@Entity('Alerts')
export class Alert {
  @PrimaryGeneratedColumn({ name: 'alert_id' })
  alertId: number;

  @Column({ name: 'elder_id' })
  elderId: number;

  @ManyToOne(() => Elder, elder => elder.alerts)
  @JoinColumn({ name: 'elder_id' })
  elder: Elder;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  type: string;

  @Column({ type: 'nvarchar', length: 20 })
  severity: string;

  @Column({ name: 'triggered_at', type: 'datetime', default: () => 'GETDATE()' })
  triggeredAt: Date;

  @Column({ type: 'nvarchar', length: 20, default: 'Open' })
  status: string;

  @Column({ name: 'assigned_to', nullable: true })
  assignedTo: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_to' })
  assignee: User;

  @Column({ name: 'acknowledged_at', type: 'datetime', nullable: true })
  acknowledgedAt: Date;

  @Column({ name: 'resolved_at', type: 'datetime', nullable: true })
  resolvedAt: Date;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  notes: string;
}